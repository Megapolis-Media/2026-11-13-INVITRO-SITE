// Ground-plane route avoiding circular furniture footprints. A bounded A* grid.
export function findRoute(start,end,bounds,obstacles){
 const step=.4,pad=.28;
 const clear=p=>Math.abs(p.x)<=bounds.x&&Math.abs(p.z)<=bounds.z&&!obstacles.some(o=>Math.hypot(p.x-o.x,p.z-o.z)<o.r+pad);
 const segment=(a,b)=>{const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.1);for(let i=1;i<=n;i++)if(!clear({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n}))return false;return true};
 if(!clear(end))return [];
 if(segment(start,end))return [end];
 const point=(x,z)=>({x:x*step,z:z*step}),key=(x,z)=>x+','+z;
 const sx=Math.round(start.x/step),sz=Math.round(start.z/step),open=[{x:sx,z:sz,g:0,f:0,parent:null}],best=new Map([[key(sx,sz),0]]);let goal=null;
 for(let loops=0;open.length&&loops<4000;loops++){open.sort((a,b)=>a.f-b.f);const n=open.shift(),p=point(n.x,n.z);if(Math.hypot(p.x-end.x,p.z-end.z)<.7&&segment(p,end)){goal=n;break}for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=n.x+dx,z=n.z+dz,q=point(x,z),g=n.g+Math.hypot(dx,dz)*step,k=key(x,z);if(!clear(q)||!segment(n.parent?p:start,q)||g>=(best.get(k)??Infinity))continue;best.set(k,g);open.push({x,z,g,f:g+Math.hypot(q.x-end.x,q.z-end.z),parent:n})}}
 if(!goal)return [];const path=[end];while(goal.parent){path.unshift(point(goal.x,goal.z));goal=goal.parent}const result=[];let anchor=start;for(let i=0;i<path.length;){let j=path.length-1;while(j>i&&!segment(anchor,path[j]))j--;result.push(path[j]);anchor=path[j];i=j+1}return result;
}
