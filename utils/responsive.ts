import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; 
const tabletBreakpoint = 768;

export const isTablet = SCREEN_WIDTH >= tabletBreakpoint;

export function getResponsiveSpacing(size: number): number {
  if (isTablet) {
    return Math.round(size * 1.5);
  }
  return Math.round(size * scale);
}

export function getResponsiveFontSize(size: number): number {
  const baseFontSize = size;
  if (isTablet) {
    return Math.round(baseFontSize * 1.25);
  }
  const newSize = baseFontSize * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export function fontSizes(size: number): number {
  return getResponsiveFontSize(size);
}

export const responsiveWidth = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

export const responsiveHeight = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};
