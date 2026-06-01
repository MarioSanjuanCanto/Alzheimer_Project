import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  Award,
  CheckCircle2,
  TrendingUp,
  XCircle,
  BarChart3,
  Calendar,
} from "lucide-react";

interface PatientStatsDashboardProps {
  userId: string;
}

interface ExerciseHistoryEntry {
  id: string;
  user_id: string;
  exercise_type: string;
  is_correct: boolean;
  difficulty_level: any;
  created_at: string;
}

export default function PatientStatsDashboard({ userId }: PatientStatsDashboardProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);

  // Idioma auxiliar para formatear los textos del gráfico
  const isSpanish = i18n.language?.startsWith("es");

  const translateType = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return isSpanish ? "Opción Múltiple" : "Multiple Choice";
      case "fill_in_the_blank":
        return isSpanish ? "Completar Espacios" : "Fill in the Blank";
      case "ordering":
        return isSpanish ? "Ordenar Eventos" : "Order Events";
      default:
        return type;
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/exercise_history/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }
        const data = await response.json();
        // Los ordenamos de forma ascendente para que los gráficos temporales fluyan de pasado a presente
        const sortedData = [...data].sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setHistory(sortedData);
      } catch (e) {
        console.error("Error fetching exercise history:", e);
        toast.error(isSpanish ? "Error al cargar el historial de ejercicios." : "Error loading exercise history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, isSpanish]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-[72rem] animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 border border-lightgrey p-6 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-[25rem] bg-gray-100 rounded-2xl"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-bggreen/20 border border-dashed border-primary/30 p-8 md:p-12 rounded-2xl text-center max-w-[72rem] my-4">
        <Activity className="mx-auto h-14 w-14 text-primary/60 mb-4 animate-bounce" />
        <h4 className="text-2xl font-semibold text-primary mb-2">
          {isSpanish ? "Sin historial de ejercicios" : "No Exercise History Yet"}
        </h4>
        <p className="text-black/70 text-lg max-w-lg mx-auto">
          {isSpanish
            ? "Este paciente aún no ha completado ningún ejercicio cognitivo. Una vez que comience a practicar, los gráficos de rendimiento y evolución aparecerán aquí en tiempo real."
            : "This patient has not completed any cognitive exercises yet. Once they start practicing, real-time performance and progress charts will appear here."}
        </p>
      </div>
    );
  }

  // --- 1. PROCESAR MÉTRICAS ACUMULADAS ---
  const totalExercises = history.length;
  const correctExercises = history.filter((x) => x.is_correct).length;
  const successRate = Math.round((correctExercises / totalExercises) * 100);

  // Obtener nivel de dificultad máximo
  let maxDifficulty = 1;
  history.forEach((x) => {
    const lvl = parseInt(x.difficulty_level, 10);
    if (!isNaN(lvl) && lvl > maxDifficulty) {
      maxDifficulty = lvl;
    }
  });

  // --- 2. DATOS PARA GRÁFICO CIRCULAR (DISTRIBUCIÓN) ---
  const distributionMap: { [key: string]: number } = {};
  history.forEach((x) => {
    distributionMap[x.exercise_type] = (distributionMap[x.exercise_type] || 0) + 1;
  });
  const pieData = Object.keys(distributionMap).map((key) => ({
    name: translateType(key),
    value: distributionMap[key],
  }));

  const PIE_COLORS = ["#10B981", "#3B82F6", "#F59E0B"];

  // --- 3. DATOS PARA GRÁFICO DE BARRAS APILADAS (RENDIMIENTO) ---
  const performanceMap: { [key: string]: { correct: number; incorrect: number } } = {
    multiple_choice: { correct: 0, incorrect: 0 },
    fill_in_the_blank: { correct: 0, incorrect: 0 },
    ordering: { correct: 0, incorrect: 0 },
  };

  history.forEach((x) => {
    const key = x.exercise_type;
    if (!performanceMap[key]) {
      performanceMap[key] = { correct: 0, incorrect: 0 };
    }
    if (x.is_correct) {
      performanceMap[key].correct += 1;
    } else {
      performanceMap[key].incorrect += 1;
    }
  });

  const barData = Object.keys(performanceMap).map((key) => ({
    type: translateType(key),
    [isSpanish ? "Correctas" : "Correct"]: performanceMap[key].correct,
    [isSpanish ? "Incorrectas" : "Incorrect"]: performanceMap[key].incorrect,
  }));

  // --- 4. DATOS PARA GRÁFICO DE ÁREA TEMPORAL (EVOLUCIÓN) ---
  // Agrupar por fecha local (YYYY-MM-DD)
  const timelineMap: { [key: string]: { total: number; correct: number } } = {};
  history.forEach((x) => {
    const dateStr = new Date(x.created_at).toLocaleDateString(
      isSpanish ? "es-ES" : "en-US",
      { month: "short", day: "numeric" }
    );
    if (!timelineMap[dateStr]) {
      timelineMap[dateStr] = { total: 0, correct: 0 };
    }
    timelineMap[dateStr].total += 1;
    if (x.is_correct) {
      timelineMap[dateStr].correct += 1;
    }
  });

  const areaData = Object.keys(timelineMap).map((date) => {
    const dayData = timelineMap[date];
    const daySuccessRate = Math.round((dayData.correct / dayData.total) * 100);
    return {
      date,
      [isSpanish ? "Ejercicios" : "Exercises"]: dayData.total,
      [isSpanish ? "Tasa de Acierto (%)" : "Success Rate (%)"]: daySuccessRate,
    };
  });

  return (
    <div className="space-y-8 max-w-[72rem] animate-in fade-in duration-700">
      <div>
        <h3 className="text-black text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          {isSpanish ? "Estadísticas de Evolución Cognitiva" : "Cognitive Evolution Statistics"}
        </h3>
        <p className="text-black/70 text-lg">
          {isSpanish
            ? "Análisis interactivo detallado de las respuestas e historial de ejercicios del paciente."
            : "Detailed interactive analysis of the patient's exercise history and responses."}
        </p>
      </div>

      {/* --- CARDS DE MÉTRICAS (Glassmorphism) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metrica 1: Total ejercicios */}
        <div className="bg-white/60 backdrop-blur-md border border-lightgrey p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-4 rounded-xl bg-primary/10 text-primary">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-darkgrey uppercase tracking-wider">
              {isSpanish ? "Ejercicios Realizados" : "Exercises Done"}
            </p>
            <h4 className="text-3xl font-bold text-black">{totalExercises}</h4>
          </div>
        </div>

        {/* Metrica 2: Tasa de acierto */}
        <div className="bg-white/60 backdrop-blur-md border border-lightgrey p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-darkgrey uppercase tracking-wider">
              {isSpanish ? "Tasa de Acierto Global" : "Global Success Rate"}
            </p>
            <h4 className="text-3xl font-bold text-emerald-600">{successRate}%</h4>
          </div>
        </div>

        {/* Metrica 3: Dificultad Máxima */}
        <div className="bg-white/60 backdrop-blur-md border border-lightgrey p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-4 rounded-xl bg-amber-500/10 text-amber-600">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-darkgrey uppercase tracking-wider">
              {isSpanish ? "Dificultad Máx. Alcanzada" : "Max. Difficulty Reached"}
            </p>
            <h4 className="text-3xl font-bold text-amber-600">{maxDifficulty}</h4>
          </div>
        </div>
      </div>

      {/* --- GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gráfico 1: Barras Apiladas (Aciertos vs Errores) */}
        <div className="bg-white/60 backdrop-blur-md border border-lightgrey p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col h-[28rem]">
          <div className="mb-4">
            <h4 className="text-xl font-bold text-black flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {isSpanish ? "Precisión por Tipo de Ejercicio" : "Accuracy by Exercise Type"}
            </h4>
            <p className="text-sm text-darkgrey">
              {isSpanish
                ? "Comparativa de respuestas correctas e incorrectas por categoría."
                : "Comparison of correct and incorrect answers by category."}
            </p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="type" stroke="#6B7280" fontSize={12} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} allowDecimals={false} />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #E5E7EB",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend iconType="circle" />
                <Bar
                  dataKey={isSpanish ? "Correctas" : "Correct"}
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey={isSpanish ? "Incorrectas" : "Incorrect"}
                  fill="#F87171"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Donut (Distribución) */}
        <div className="bg-white/60 backdrop-blur-md border border-lightgrey p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col h-[28rem]">
          <div className="mb-4">
            <h4 className="text-xl font-bold text-black flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {isSpanish ? "Distribución del Trabajo del Paciente" : "Patient Work Distribution"}
            </h4>
            <p className="text-sm text-darkgrey">
              {isSpanish
                ? "Proporción de ejercicios completados por categoría."
                : "Proportion of completed exercises by category."}
            </p>
          </div>
          <div className="flex-1 w-full min-h-0 flex items-center justify-center">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="40%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #E5E7EB",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={48} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico 3: Área (Evolución en el Tiempo) */}
      <div className="bg-white/60 backdrop-blur-md border border-lightgrey p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col h-[28rem]">
        <div className="mb-4">
          <h4 className="text-xl font-bold text-black flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {isSpanish ? "Evolución y Actividad Histórica" : "Evolution and Historical Activity"}
          </h4>
          <p className="text-sm text-darkgrey">
            {isSpanish
              ? "Tendencia diaria de ejercicios completados y tasa de acierto correspondiente."
              : "Daily trend of completed exercises and corresponding success rate."}
          </p>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#85501B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#85501B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
              <ChartTooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend iconType="circle" />
              <Area
                type="monotone"
                dataKey={isSpanish ? "Tasa de Acierto (%)" : "Success Rate (%)"}
                stroke="#85501B"
                fillOpacity={1}
                fill="url(#colorSuccess)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey={isSpanish ? "Ejercicios" : "Exercises"}
                stroke="#3B82F6"
                fill="none"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
