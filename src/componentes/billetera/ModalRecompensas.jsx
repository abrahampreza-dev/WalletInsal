import React from 'react';
import { X, GraduationCap, Users, Trophy, CheckCircle2, Award } from 'lucide-react';

export default function ModalRecompensas({ estaAbierto, alCerrar }) {
  if (!estaAbierto) return null;

  const categoriasRecompensas = [
    {
      titulo: "Recompensa Educativa",
      icono: GraduationCap,
      color: "from-blue-600 to-sky-500",
      borde: "border-[#0A4D9C]/50",
      bgIcono: "bg-[#0A4D9C]/15 text-[#0A4D9C]",
      descripcion: "Fomenta el aprendizaje, el rendimiento académico y el esfuerzo en las áreas técnicas.",
      misiones: [
{ nombre: "Promedio destacado en periodo técnico", premio: "+25.00 SL - BITS", completado: false },
        { nombre: "Participación en Expotecnia 2026", premio: "+15.00 SL - BITS", completado: false },
        { nombre: "Asistencia perfecta a talleres y laboratorios", premio: "+10.00 SL - BITS", completado: false }
      ]
    },
    {
      titulo: "Recompensa Comunitaria",
      icono: Users,
      color: "from-orange-600 to-amber-500",
      borde: "border-[#E67A15]/50",
      bgIcono: "bg-[#E67A15]/15 text-[#E67A15]",
      descripcion: "Fortalece la unión, el trabajo en equipo y el respeto entre toda la comunidad San Luis.",
      misiones: [
        { nombre: "Apoyo a compañeros en asesorías estudiantiles", premio: "+20.00 SL - BITS", completado: false },
        { nombre: "Campaña de reciclaje y sustentabilidad verde", premio: "+10.00 SL - BITS", completado: false },
        { nombre: "Voluntariado en eventos institucionales", premio: "+15.00 SL - BITS", completado: false }
      ]
    },
    {
      titulo: "Recompensa Inspiradora",
      icono: Trophy,
      color: "from-purple-600 to-indigo-500",
      borde: "border-purple-500/30",
      bgIcono: "bg-purple-500/10 text-purple-600",
      descripcion: "Reconoce los proyectos más creativos e innovadores que impulsan a los demás a seguir creciendo.",
      misiones: [
        { nombre: "Primer lugar en prototipado con IA y Robótica", premio: "+50.00 SL - BITS", completado: false },
        { nombre: "Premio del público por video del equipo", premio: "+30.00 SL - BITS", completado: false },
        { nombre: "Mención de honor de docentes evaluadores", premio: "+25.00 SL - BITS", completado: false }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-600/40 flex items-center justify-center text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Programa Institucional de Incentivos y Recompensas</h3>
              <p className="text-xs text-slate-400">Valores, logros y méritos del Instituto Nacional San Luís</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-2 text-slate-400 hover:text-white bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          <p className="text-xs text-slate-400 leading-relaxed">
            Los <strong>SL - BITS</strong> son la moneda digital oficial: representan el reconocimiento a tu dedicación académica, compañerismo y creatividad en la Expotecnia 2026.
          </p>

          <div className="space-y-4">
            {categoriasRecompensas.map((cat, idx) => {
              const Icono = cat.icono;
              return (
                <div key={idx} className={`p-5 rounded-3xl bg-white border ${cat.borde} space-y-4`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${cat.bgIcono} flex items-center justify-center flex-shrink-0`}>
                      <Icono className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{cat.titulo}</h4>
                      <p className="text-xs text-slate-400">{cat.descripcion}</p>
                    </div>
                  </div>

                  {/* Lista de misiones */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    {cat.misiones.map((mis, mIdx) => (
                      <div key={mIdx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${mis.completado ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className={mis.completado ? 'text-white font-medium' : 'text-slate-400'}>
                            {mis.nombre}
                          </span>
                        </div>
                        <span className={`font-black ${mis.completado ? 'text-[#E67A15]' : 'text-slate-400'}`}>
                          {mis.premio}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}

