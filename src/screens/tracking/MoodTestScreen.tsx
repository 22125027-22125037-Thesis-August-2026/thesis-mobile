import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

import * as trackingApi from '../../api/trackingApi';
import { MoodLogRequest, MoodLogResponse } from '../../types/tracking';

const MoodTestScreen: React.FC = () => {
  const [moodTag, setMoodTag] = useState<string>('happy');
  const [positivityScore, setPositivityScore] = useState<number>(7);

  const handleSubmit = async (): Promise<void> => {
    const request: MoodLogRequest = {
      moodTag,
      positivityScore,
    };

    try {
      const response: MoodLogResponse = await trackingApi.createMoodLog(request);
      Alert.alert('Success!', 'New log ID: ' + response.id);
    } catch {
      Alert.alert('Error', 'Failed to create mood log.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mood Tag</Text>
      <TextInput
        style={styles.input}
        value={moodTag}
        onChangeText={setMoodTag}
        placeholder="Enter mood"
      />

      <Text style={styles.label}>Positivity Score</Text>
      <TextInput
        style={styles.input}
        value={String(positivityScore)}
        onChangeText={(text: string) => {
          const parsedValue = Number(text);
          setPositivityScore(Number.isNaN(parsedValue) ? 0 : parsedValue);
        }}
        keyboardType="numeric"
        placeholder="0 - 10"
      />

      <Button title="Submit Mood Log" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

export default MoodTestScreen;
