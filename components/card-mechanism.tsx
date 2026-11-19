
/** Independent motion layers on the approved KV artwork, not a rotated flat card. */
export default function CardMechanism({kind}:{kind:string}){
return <div className={'card-mechanism mechanism-'+kind} aria-hidden="true">
 {kind==='pelsh'&&<><div className="vinyl-optical-sheen"/><div className="vinyl-contact-key"/><div className="vinyl-lamps"><i/><i/><i/></div></>}
 {kind==='mail'&&<><div className="mail-cavity"/><div className="mail-door"><i/></div><div className="mail-lever"/><img className="mail-envelope" src="/games-v2/envelope.png" alt=""/></>}
 </div>;
}
