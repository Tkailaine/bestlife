export function Atmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Base atmosférica: azul acinzentado -> cinza -> off-white quente */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, #E3E8F2 0%, #DFE2E8 45%, #ECEAE3 100%)' }}
      />

      {/* Formas abstratas desfocadas nas cores da BestLife */}
      <div
        className="blob"
        style={{
          width: '52vw',
          height: '52vw',
          left: '-14vw',
          top: '-18vw',
          background: 'radial-gradient(circle, #264DA4 0%, transparent 68%)',
          opacity: 0.38,
        }}
      />
      <div
        className="blob"
        style={{
          width: '42vw',
          height: '42vw',
          right: '-12vw',
          top: '6vh',
          background: 'radial-gradient(circle, #A9BDE6 0%, transparent 70%)',
          animationDelay: '-8s',
        }}
      />
      <div
        className="blob"
        style={{
          width: '38vw',
          height: '38vw',
          right: '6vw',
          bottom: '-16vw',
          background: 'radial-gradient(circle, #F8BF29 0%, transparent 70%)',
          opacity: 0.3,
          animationDelay: '-14s',
        }}
      />
      <div
        className="blob"
        style={{
          width: '34vw',
          height: '34vw',
          left: '18vw',
          bottom: '-12vw',
          background: 'radial-gradient(circle, #FFFFFF 0%, transparent 70%)',
          opacity: 0.9,
          animationDelay: '-4s',
        }}
      />

      {/* Trama de pontos sutil, desaparecendo para baixo */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgb(38 38 38 / 0.07) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(to bottom, black, transparent 65%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 65%)',
        }}
      />
    </div>
  );
}

