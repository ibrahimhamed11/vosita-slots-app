import { useLocalSearchParams } from 'expo-router';
import SlotsViewScreen from '../screens/SlotsViewScreen';

export default function SlotsViewScreenStandalone() {
  const { timezone } = useLocalSearchParams<{ timezone?: string; }>();

  return <SlotsViewScreen initialTimezone={typeof timezone === 'string' ? timezone : undefined} />;
}