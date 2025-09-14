import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Svg, Line, Circle, G, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors, Typography } from '../constants/Colors';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 80;
const GRAPH_HEIGHT = 200;

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface ProgressGraphProps {
  title: string;
  data: DataPoint[];
  maxValue?: number;
  minValue?: number;
  color?: string;
  unit?: string;
  showTrend?: boolean;
}

export const ProgressGraph: React.FC<ProgressGraphProps> = ({
  title,
  data,
  maxValue,
  minValue = 0,
  color = Colors.primary,
  unit = '',
  showTrend = true
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available yet</Text>
          <Text style={styles.emptySubtext}>Start tracking to see your progress</Text>
        </View>
      </View>
    );
  }

  // Calculate graph dimensions and scaling
  const padding = 40;
  const graphWidth = GRAPH_WIDTH - (padding * 2);
  const graphHeight = GRAPH_HEIGHT - (padding * 2);
  
  const maxVal = maxValue || Math.max(...data.map(d => d.value)) * 1.1;
  const minVal = minValue;
  const valueRange = maxVal - minVal;
  
  // Scale data points to graph coordinates
  const scaledData = data.map((point, index) => ({
    x: padding + (index / (data.length - 1)) * graphWidth,
    y: padding + graphHeight - ((point.value - minVal) / valueRange) * graphHeight,
    value: point.value,
    date: point.date,
    label: point.label
  }));

  // Calculate trend
  const trend = showTrend && data.length > 1 ? 
    (data[data.length - 1].value - data[0].value) / data.length : 0;

  const getTrendColor = () => {
    if (trend > 0) return Colors.success;
    if (trend < 0) return Colors.danger;
    return Colors.textMuted;
  };

  const getTrendText = () => {
    if (trend > 0.1) return '↗ Improving';
    if (trend < -0.1) return '↘ Declining';
    return '→ Stable';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showTrend && data.length > 1 && (
          <View style={styles.trendContainer}>
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {getTrendText()}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.graphContainer}>
        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
          <Defs>
            <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </LinearGradient>
          </Defs>
          
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <Line
              key={index}
              x1={padding}
              y1={padding + ratio * graphHeight}
              x2={padding + graphWidth}
              y2={padding + ratio * graphHeight}
              stroke={Colors.primaryLight}
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const value = maxVal - (ratio * valueRange);
            return (
              <Text
                key={index}
                x={padding - 10}
                y={padding + ratio * graphHeight + 5}
                fontSize="12"
                fill={Colors.textMuted}
                textAnchor="end"
              >
                {value.toFixed(1)}
              </Text>
            );
          })}
          
          {/* Data line */}
          {scaledData.length > 1 && (
            <Line
              x1={scaledData[0].x}
              y1={scaledData[0].y}
              x2={scaledData[1].x}
              y2={scaledData[1].y}
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
          
          {scaledData.length > 2 && scaledData.slice(1).map((point, index) => (
            <Line
              key={index}
              x1={scaledData[index].x}
              y1={scaledData[index].y}
              x2={point.x}
              y2={point.y}
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          
          {/* Data points */}
          {scaledData.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              stroke={Colors.background}
              strokeWidth="2"
            />
          ))}
          
          {/* Area under curve */}
          {scaledData.length > 1 && (
            <G>
              <Line
                x1={scaledData[0].x}
                y1={padding + graphHeight}
                x2={scaledData[0].x}
                y2={scaledData[0].y}
                stroke="url(#gradient)"
                strokeWidth="0"
              />
              {scaledData.map((point, index) => (
                <Line
                  key={index}
                  x1={point.x}
                  y1={padding + graphHeight}
                  x2={point.x}
                  y2={point.y}
                  stroke="url(#gradient)"
                  strokeWidth="0"
                />
              ))}
            </G>
          )}
        </Svg>
      </View>
      
      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>
        {data.map((point, index) => {
          if (data.length <= 5 || index % Math.ceil(data.length / 5) === 0) {
            return (
              <Text key={index} style={styles.xAxisLabel}>
                {new Date(point.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            );
          }
          return null;
        })}
      </View>
      
      {/* Current value */}
      <View style={styles.currentValueContainer}>
        <Text style={styles.currentValueLabel}>Latest:</Text>
        <Text style={[styles.currentValue, { color }]}>
          {data[data.length - 1].value.toFixed(1)}{unit}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
  },
  trendContainer: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
  },
  graphContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  xAxisLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  currentValueContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  currentValueLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginRight: 8,
  },
  currentValue: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodySemiBold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    opacity: 0.7,
  },
});
