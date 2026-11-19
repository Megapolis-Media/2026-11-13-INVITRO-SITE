import type {CSSProperties} from 'react';
export default function SnowLayer(){return <div className="independent-snow" aria-hidden="true">{Array.from({length:28},(_,i)=><i key={i} style={{'--x':((i*37)%100)+'vw','--delay':(-i*.77)+'s','--duration':(12+i%7)+'s','--size':(2+i%4)+'px'} as CSSProperties}/>)}</div>}
