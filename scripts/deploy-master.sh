#!/usr/bin/env bash
set -euo pipefail
umask 077

revision=${1:-${SSH_ORIGINAL_COMMAND:-}}
if [[ $# -gt 1 || ! "$revision" =~ ^[0-9a-f]{40}$ ]]; then
    echo 'Expected the approved master commit SHA.' >&2
    exit 2
fi

root=/srv/invitrotv
deploy=$root/deploy
source_repo=$root/source.git
repository=https://github.com/Megapolis-Media/2026-11-13-INVITRO-SITE.git
container=invitrotv-web
image="invitrotv:$revision"

exec 9>"$deploy/master-release.lock"
flock -w 30 9
test -r "$deploy/admin.dev.vars"
test -r "$deploy/start-container.sh"
test -r "$deploy/verify-container.sh"
test -d "$root/data"

git --git-dir="$source_repo" fetch --no-tags --depth=1 "$repository" refs/heads/master
if [[ $(git --git-dir="$source_repo" rev-parse FETCH_HEAD) != "$revision" ]]; then
    echo 'This commit is no longer the tip of master. Review the latest deployment instead.' >&2
    exit 1
fi

previous_id=$(docker container inspect --format '{{.Id}}' "$container")
previous_image=$(docker container inspect --format '{{.Config.Image}}' "$previous_id")
[[ "$previous_image" =~ ^invitrotv:[0-9a-f]{40}$ ]]

context=
incomplete_backup=
release_marker=
switch_started=false

finish() {
    local status=$?
    trap - EXIT
    set +e
    if (( status != 0 )) && [[ "$switch_started" == true ]]; then
        local running_id running_image previous_name
        running_id=$(docker container inspect --format '{{.Id}}' "$container" 2>/dev/null)
        if [[ -n "$running_id" && "$running_id" != "$previous_id" ]]; then
            running_image=$(docker container inspect --format '{{.Config.Image}}' "$running_id")
            if [[ "$running_image" == "$image" ]]; then
                docker container rm --force "$running_id" >/dev/null
            fi
        fi
        previous_name=$(docker container inspect --format '{{.Name}}' "$previous_id")
        if [[ "$previous_name" != "/$container" ]]; then
            docker container rename "$previous_id" "$container"
        fi
        if docker container start "$previous_id" >/dev/null; then
            echo 'Restarted the previous container with the current data. The pre-release snapshot is available for recovery.' >&2
        else
            echo 'Could not restart the previous container. Inspect the service and its pre-release snapshot.' >&2
        fi
    fi
    if [[ -n "$context" ]]; then rm -rf -- "$context"; fi
    if [[ -n "$incomplete_backup" ]]; then rm -rf -- "$incomplete_backup"; fi
    if [[ -n "$release_marker" ]]; then rm -f -- "$release_marker"; fi
    exit "$status"
}
trap finish EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

if [[ "$previous_image" != "$image" ]]; then
    if ! docker image inspect "$image" >/dev/null 2>&1; then
        context=$(mktemp -d "$root/releases/.build-$revision.XXXXXX")
        git --git-dir="$source_repo" archive "$revision" | tar -x -C "$context"
        docker build --label "org.opencontainers.image.revision=$revision" --tag "$image" "$context"
    fi
    [[ $(docker image inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image") == "$revision" ]]
    if [[ $(git ls-remote "$repository" refs/heads/master | cut -f1) != "$revision" ]]; then
        echo 'Master changed during the build. Review the latest deployment instead.' >&2
        exit 1
    fi

    switch_started=true
    docker container stop --timeout 20 "$previous_id" >/dev/null
    incomplete_backup=$(mktemp -d "$root/releases/.backup-$revision.XXXXXX")
    cp -a --reflink=auto -- "$root/data" "$incomplete_backup/data"
    backup="$root/releases/${incomplete_backup##*/.}"
    mv -T -- "$incomplete_backup" "$backup"
    incomplete_backup=
    printf 'Pre-release data snapshot: %s\n' "$backup/data"

    docker container rename "$previous_id" "$container-previous-${previous_id:0:12}"
    bash "$deploy/start-container.sh" "$revision"
fi

bash "$deploy/verify-container.sh"
release_marker=$(mktemp "$root/.release.XXXXXX")
printf '%s\n' "$revision" > "$release_marker"
mv -T -- "$release_marker" "$root/.release"
release_marker=
switch_started=false
