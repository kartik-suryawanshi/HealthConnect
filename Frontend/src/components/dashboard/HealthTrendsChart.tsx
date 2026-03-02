import { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    ZAxis
} from 'recharts';
import { format } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Activity, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthMetric {
    _id: string;
    metricType: string;
    value: any;
    severity: "Normal" | "Elevated" | "Critical";
    contextReason?: string;
    recordedAt: string;
}

interface HealthTrendsChartProps {
    metrics: HealthMetric[];
    title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-background border border-border p-3 rounded-lg shadow-md w-64 z-50">
                <p className="font-semibold">{format(new Date(data.recordedAt), 'MMM d, yyyy h:mm a')}</p>
                <p className="text-primary font-medium mt-1">
                    {data.metricType}: {data.value} {data.metricType === 'Blood Sugar' ? 'mg/dL' : ''}
                </p>
                <div className="mt-2 space-y-1 text-sm">
                    <p>
                        <span className="text-muted-foreground">Severity: </span>
                        <span className={cn(
                            "font-medium",
                            data.severity === 'Normal' ? "text-success" :
                                data.severity === 'Elevated' ? "text-warning" : "text-destructive"
                        )}>
                            {data.severity}
                        </span>
                    </p>
                    {data.contextReason && (
                        <p className="text-muted-foreground border-t pt-1 mt-1">
                            " {data.contextReason} "
                        </p>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

export function HealthTrendsChart({ metrics, title = "Health Trends" }: HealthTrendsChartProps) {
    const [metricFilter, setMetricFilter] = useState<string>("Blood Pressure");

    const filteredData = useMemo(() => {
        return metrics
            .filter(m => m.metricType === metricFilter)
            .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
            .map(m => {
                // Parse values for charting
                let numericValue = m.value;
                let systolic, diastolic;

                if (m.metricType === 'Blood Pressure' && typeof m.value === 'string') {
                    const parts = m.value.split('/');
                    if (parts.length === 2) {
                        systolic = parseInt(parts[0]);
                        diastolic = parseInt(parts[1]);
                    }
                } else if (typeof m.value === 'string') {
                    numericValue = parseInt(m.value) || 0;
                }

                return {
                    ...m,
                    numericValue,
                    systolic,
                    diastolic,
                    timestamp: new Date(m.recordedAt).getTime()
                };
            });
    }, [metrics, metricFilter]);

    if (!metrics || metrics.length === 0) {
        return (
            <div className="bg-card border rounded-lg p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                <Activity className="h-12 w-12 mb-4 opacity-20" />
                <p>No health metrics recorded yet.</p>
            </div>
        );
    }

    const isEvent = metricFilter === 'Medical Event';

    return (
        <div className="bg-card border rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-primary" />
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track vital signs and medical events over time.
                    </p>
                </div>
                <Select value={metricFilter} onValueChange={setMetricFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Metric" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Blood Pressure">Blood Pressure</SelectItem>
                        <SelectItem value="Blood Sugar">Blood Sugar</SelectItem>
                        <SelectItem value="Heart Rate">Heart Rate</SelectItem>
                        <SelectItem value="Medical Event">Medical Events</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="h-[300px] w-full">
                {filteredData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        No data available for the selected metric.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {isEvent ? (
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="timestamp"
                                    type="number"
                                    domain={['auto', 'auto']}
                                    tickFormatter={(val) => format(new Date(val), 'MMM d')}
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                />
                                <YAxis dataKey="value" type="category" name="Event" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <ZAxis range={[100, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Scatter data={filteredData} fill="hsl(var(--destructive))" shape="star" />
                            </ScatterChart>
                        ) : metricFilter === 'Blood Pressure' ? (
                            <LineChart data={filteredData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="timestamp"
                                    type="number"
                                    domain={['auto', 'auto']}
                                    tickFormatter={(val) => format(new Date(val), 'MMM d')}
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                />
                                <YAxis
                                    domain={['dataMin - 10', 'dataMax + 10']}
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="systolic"
                                    name="Systolic"
                                    stroke="hsl(var(--destructive))"
                                    strokeWidth={2}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="diastolic"
                                    name="Diastolic"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        ) : (
                            <LineChart data={filteredData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="timestamp"
                                    type="number"
                                    domain={['auto', 'auto']}
                                    tickFormatter={(val) => format(new Date(val), 'MMM d')}
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                />
                                <YAxis
                                    domain={['dataMin - 10', 'dataMax + 10']}
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="numericValue"
                                    name={metricFilter}
                                    stroke={metricFilter === 'Blood Sugar' ? "hsl(var(--warning))" : "hsl(var(--primary))"}
                                    strokeWidth={2}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
