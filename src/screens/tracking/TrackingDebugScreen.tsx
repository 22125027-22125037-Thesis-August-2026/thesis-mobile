import React, { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import * as trackingApi from '../../api/trackingApi';
import * as diaryApi from '../../api/diaryApi';
import {
  MoodLogRequest,
  MoodLogResponse,
  SleepLogRequest,
  SleepLogResponse,
  StreakResponse,
} from '../../types/tracking';

const TrackingDebugScreen: React.FC = () => {
  const [moodTag, setMoodTag] = useState<string>('happy');
  const [moodPositivityScore, setMoodPositivityScore] = useState<number>(7);

  const [bedTime, setBedTime] = useState<string>('2026-03-04T22:30:00.000Z');
  const [wakeTime, setWakeTime] = useState<string>('2026-03-05T06:30:00.000Z');

  const [diaryContent, setDiaryContent] = useState<string>('Today was productive.');
  const [diaryPositivityScore, setDiaryPositivityScore] = useState<number>(8);

  const parseScore = (value: string): number => {
    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  };

  const handleMoodSubmit = async (): Promise<void> => {
    const request: MoodLogRequest = {
      moodTag,
      positivityScore: moodPositivityScore,
    };

    try {
      const response: MoodLogResponse = await trackingApi.createMoodLog(request);
      Alert.alert('Mood Success', 'New mood log ID: ' + response.id);
    } catch {
      Alert.alert('Mood Error', 'Failed to create mood log.');
    }
  };

  const handleSleepSubmit = async (): Promise<void> => {
    const request: SleepLogRequest = {
      bedTime,
      wakeTime,
    };

    try {
      const response: SleepLogResponse = await trackingApi.createSleepLog(request);
      Alert.alert('Sleep Success', 'New sleep log ID: ' + response.id);
    } catch {
      Alert.alert('Sleep Error', 'Failed to create sleep log.');
    }
  };

  const handleStreakLoad = async (): Promise<void> => {
    try {
      const response: StreakResponse = await trackingApi.getStreak();
      Alert.alert('Streak Success', 'Current streak: ' + response.currentCount);
    } catch {
      Alert.alert('Streak Error', 'Failed to fetch streak.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tracking Debug Dashboard</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood</Text>
        <TextInput
          style={styles.input}
          value={moodTag}
          onChangeText={setMoodTag}
          placeholder="Mood tag"
        />
        <TextInput
          style={styles.input}
          value={String(moodPositivityScore)}
          onChangeText={(text: string) => setMoodPositivityScore(parseScore(text))}
          keyboardType="numeric"
          placeholder="Positivity score"
        />
        <Button title="Submit Mood" onPress={handleMoodSubmit} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sleep</Text>
        <TextInput
          style={styles.input}
          value={bedTime}
          onChangeText={setBedTime}
          placeholder="Bed time (ISO)"
        />
        <TextInput
          style={styles.input}
          value={wakeTime}
          onChangeText={setWakeTime}
          placeholder="Wake time (ISO)"
        />
        <Button title="Submit Sleep" onPress={handleSleepSubmit} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Streak</Text>
        <Button title="Load Streak" onPress={handleStreakLoad} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
});

export default TrackingDebugScreen;
