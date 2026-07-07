import { View, type ViewProps } from 'react-native';
import { Colores } from '@/constants/colores';

export type VistaTemaProps = ViewProps & {
  type?: keyof typeof Colores;
};

export function VistaTema({ style, type = 'fondoPrincipal', ...otherProps }: VistaTemaProps) {
  return <View style={[{ backgroundColor: Colores[type] }, style]} {...otherProps} />;
}
