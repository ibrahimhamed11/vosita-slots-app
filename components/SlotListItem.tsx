import React from 'react';
import { List, Chip } from 'react-native-paper';
import { StyleSheet, Animated, Easing, TouchableOpacity, View } from 'react-native';
import { SlotListItemProps } from '../types/slotsView';
import { LinearGradient } from 'expo-linear-gradient';
import { getResponsiveSpacing } from '../utils/responsive';

export const SlotListItem: React.FC<SlotListItemProps> = ({
  slot,
  available,
  status,
  isLargeScreen,
  formatSlotTime,
  theme,
  onPress,
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;
  const pulseValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Fade-in animation when component mounts
    Animated.parallel([
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      )
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const pulseOpacity = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.15]
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        }
      ]}
    >
      {available && (
        <Animated.View 
          style={[
            styles.pulseBackground,
            {
              backgroundColor: theme.colors.primary,
              opacity: pulseOpacity
            }
          ]}
        />
      )}
      
      <LinearGradient
        colors={[
          available ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
          available ? `${theme.colors.primaryContainer}E6` : `${theme.colors.surfaceVariant}E6`
        ]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!onPress}
        >
          <List.Item
            title={`${formatSlotTime(slot.startTime)} - ${formatSlotTime(slot.endTime)}`}
            description={undefined}
            left={(props) => (
              <View style={styles.iconContainer}>
                <List.Icon 
                  {...props} 
                  icon={status.icon}
                  color={status.color}
                  style={styles.icon}
                />
              </View>
            )}
            right={() => (
              <Chip 
                mode="outlined"
                textStyle={{ 
                  color: status.color,
                  fontSize: isLargeScreen ? 14 : 12,
                  fontWeight: '600',
                  // Ensure text wraps if needed
                  flexShrink: 1,
                  flexWrap: 'wrap',
                }}
                style={[styles.chip, { 
                  borderColor: status.color,
                  backgroundColor: theme.colors.surface + 'CC',
                  // Allow chip to grow and wrap content
                  minWidth: 0,
                  maxWidth: '100%',
                  flexShrink: 1,
                  flexWrap: 'wrap',
                  height: undefined, // Remove fixed height
                }]}
              >
                {status.text}
              </Chip>
            )}
            style={[
              styles.slotItem,
              { 
                marginVertical: isLargeScreen ? 8 : 4,
              }
            ]}
            titleStyle={{ 
              fontSize: isLargeScreen ? 16 : 14,
              fontWeight: '700',
              color: theme.colors.onSurface,
              letterSpacing: 0.2,
            }}
            descriptionStyle={{ 
              fontSize: isLargeScreen ? 14 : 12,
              color: theme.colors.onSurfaceVariant,
              fontWeight: '400',
            }}
          />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: getResponsiveSpacing(8),
    marginVertical: getResponsiveSpacing(4),
    borderRadius: getResponsiveSpacing(16),
    overflow: 'hidden',
  },
  gradientBackground: {
    borderRadius: getResponsiveSpacing(16),
  },
  pulseBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: getResponsiveSpacing(16),
  },
  slotItem: {
    borderRadius: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(8),
    paddingHorizontal: getResponsiveSpacing(16),
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: getResponsiveSpacing(8),
    width: getResponsiveSpacing(32),
    height: getResponsiveSpacing(32),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  icon: {
    alignSelf: 'center',
  },
  chip: {
    alignSelf: 'center',
    marginRight: getResponsiveSpacing(8),
    // Remove fixed height and allow wrapping
    borderWidth: 1.5,
    borderRadius: getResponsiveSpacing(4),
    minWidth: 0,
    maxWidth: '100%',
    flexShrink: 1,
    flexWrap: 'wrap',
    height: undefined,
  },
});