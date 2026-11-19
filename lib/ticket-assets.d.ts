declare module '*.jpg?inline' {
  const dataUri: string;
  export default dataUri;
}
declare module '*.jpg?url' {
  const url: string;
  export default url;
}
