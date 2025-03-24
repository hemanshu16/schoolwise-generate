
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ReportData, generateReportData } from "@/utils/mock-data";
import { Award, BarChart as BarChartIcon, BookOpen, GraduationCap, Menu, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getStaggeredDelay } from "@/utils/animations";

interface ReportViewProps {
  type: "district" | "taluka" | "school";
  name: string;
  examName?: string;
  className?: string;
}

const ReportView = ({ type, name, examName = "", className }: ReportViewProps) => {
  const [reportData] = useState<ReportData>(() => generateReportData(type, name));
  
  const chartData = reportData.subjects.map((subject) => ({
    name: subject.name,
    "Average Marks": subject.averageMarks,
    "Pass Percentage": subject.passPercentage,
  }));
  
  const statItems = [
    {
      icon: Users,
      label: "Total Students",
      value: reportData.stats.totalStudents.toLocaleString(),
    },
    {
      icon: BookOpen,
      label: "Pass Percentage",
      value: `${reportData.stats.passPercentage}%`,
    },
    {
      icon: GraduationCap,
      label: "Average Marks",
      value: reportData.stats.averageMarks,
    },
    {
      icon: Award,
      label: "Top Scorer",
      value: reportData.stats.topScorer,
    },
  ];

  return (
    <div className={cn("w-full animate-fade-in", className)}>
      <header className="mb-8 text-center">
        <span className="selection-badge bg-primary/10 text-primary border-0 mb-2">
          {type.charAt(0).toUpperCase() + type.slice(1)} Report
        </span>
        <h1 className="text-2xl md:text-3xl font-bold">{reportData.title}</h1>
        <p className="text-muted-foreground mt-2">
          {reportData.description}
          {examName && <span className="font-medium"> - {examName}</span>}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statItems.map((item, index) => (
          <div 
            key={item.label}
            className="bg-white rounded-lg shadow p-4 border border-border/60 transition-all hover:shadow-md"
            style={{ animationDelay: getStaggeredDelay(index) }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{item.label}</p>
                <p className="text-2xl font-semibold mt-1">{item.value}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-md text-primary">
                <item.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md border border-border/60 p-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-primary" />
            Subject Performance
          </h2>
          <button className="p-1.5 rounded-md hover:bg-muted/60 transition-colors">
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              />
              <Legend />
              <Bar 
                dataKey="Average Marks" 
                fill="hsl(var(--primary))" 
                activeBar={<Rectangle fill="hsl(var(--primary)/0.8)" />} 
              />
              <Bar 
                dataKey="Pass Percentage" 
                fill="hsl(var(--primary)/0.5)" 
                activeBar={<Rectangle fill="hsl(var(--primary)/0.4)" />} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-border/60 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Subject Details
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subject</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Average Marks</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pass Percentage</th>
              </tr>
            </thead>
            <tbody>
              {reportData.subjects.map((subject, index) => (
                <tr 
                  key={subject.name} 
                  className={cn("transition-colors hover:bg-muted/30", index !== reportData.subjects.length - 1 && "border-b")}
                >
                  <td className="px-4 py-3 font-medium">{subject.name}</td>
                  <td className="px-4 py-3">{subject.averageMarks}</td>
                  <td className="px-4 py-3">{subject.passPercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
