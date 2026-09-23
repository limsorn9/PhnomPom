import React, { useMemo, useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Building2, Layers, BookOpen, Wrench, HeartHandshake, ShieldCheck } from 'lucide-react';

interface D3BudgetCategoryPieChartProps {
  transactions?: any[];
}

export const D3BudgetCategoryPieChart: React.FC<D3BudgetCategoryPieChartProps> = ({ transactions }) => {
  const { budgetTransactions } = useSchool();
  const txList = transactions || budgetTransactions;

  // Aggregate by category / type
  const categoryData = useMemo(() => {
    const map: { [key: string]: number } = {
      'សម្ភារៈឧបទេស & បរិក្ខារ': 0,
      'ជួសជុលសាងសង់ (Infrastructure)': 0,
      'សកម្មភាពក្រៅម៉ោងសិក្សា & កីឡា': 0,
      'សុខភាព & អនាម័យសាលា': 0,
      'រដ្ឋបាល & ប្រតិបត្តិការ': 0,
      'ផ្សេងៗ': 0
    };

    txList.forEach(tx => {
      const amt = Number(tx.amountRiel) || 0;
      const cat = (tx.category || '').toLowerCase();
      const title = (tx.title || '').toLowerCase();

      if (cat.includes('សម្ភារៈ') || title.includes('សម្ភារៈ') || title.includes('សៀវភៅ')) {
        map['សម្ភារៈឧបទេស & បរិក្ខារ'] += amt;
      } else if (cat.includes('ជួសជុល') || cat.includes('សាងសង់') || title.includes('ជួសជុល') || title.includes('អគារ')) {
        map['ជួសជុលសាងសង់ (Infrastructure)'] += amt;
      } else if (cat.includes('កីឡា') || cat.includes('ក្រៅម៉ោង') || title.includes('កីឡា')) {
        map['សកម្មភាពក្រៅម៉ោងសិក្សា & កីឡា'] += amt;
      } else if (cat.includes('សុខភាព') || cat.includes('អនាម័យ') || title.includes('សុខភាព')) {
        map['សុខភាព & អនាម័យសាលា'] += amt;
      } else if (tx.type === 'expense') {
        map['រដ្ឋបាល & ប្រតិបត្តិការ'] += amt;
      } else {
        map['ផ្សេងៗ'] += amt;
      }
    });

    // Convert to array in millions Riel
    return Object.keys(map)
      .map(key => ({
        name: key,
        value: Number((map[key] / 1000000).toFixed(2)),
        rawRiel: map[key]
      }))
      .filter(item => item.value > 0);
  }, [txList]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  const totalExpenseRiel = categoryData.reduce((sum, item) => sum + item.rawRiel, 0);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 font-battambang">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            ការបែងចែកថវិកាតាមប្រភេទជំពូក (D3 Budget Breakdown by Category)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            វិភាគចំណាយសរុបលើហេដ្ឋារចនាសម្ព័ន្ធ សម្ភារៈសិក្សា កីឡា និងសកម្មភាពអភិវឌ្ឍសាលារៀន
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg">
            សរុបចំណាយ: {totalExpenseRiel.toLocaleString()} ៛
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Pie/Donut Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} លានរៀល`, 'ទឹកប្រាក់']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown Breakdown Cards */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            សេចក្តីលម្អិតតាមជំពូក (Category Breakdown Summary)
          </h4>
          {categoryData.map((cat, idx) => {
            const percentage = totalExpenseRiel > 0 ? Math.round((cat.rawRiel / totalExpenseRiel) * 100) : 0;
            return (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{cat.name}</span>
                    <div className="text-[10px] text-slate-500 font-mono">ចំណាយ: {cat.rawRiel.toLocaleString()} ៛</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
