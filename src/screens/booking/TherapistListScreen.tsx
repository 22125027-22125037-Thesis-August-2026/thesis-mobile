// src/screens/booking/TherapistListScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types'; // Import your map
import Ionicons from 'react-native-vector-icons/Ionicons'; // BEGIN: Fix for Ionicons import
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { getTherapists, Therapist } from '../../api/therapistApi';
import styles from './TherapistListScreen.styles';

const TherapistListScreen = () => {
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filtered, setFiltered] = useState<Therapist[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTherapists()
      .then(data => {
        setTherapists(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(
      therapists.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.specialty.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, therapists]);

  const renderCard = ({ item }: { item: Therapist }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.specialty}>{item.specialty}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
        </View>
        <CustomButton
          title="Book Now"
          onPress={() => navigation.navigate('TherapistDetails', { id: item.id })}
        />
        // END: Fix for CustomButton style
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Curved Header */}
      <View style={styles.header}>
        <View style={styles.circleLarge} />
        <View style={styles.circleSmall} />
        <Text style={styles.headerTitle}>Find a Therapist</Text>
      </View>
      <View style={styles.searchBar}>
        <CustomInput
          iconName="search" // Added iconName prop
          placeholder="Search therapists"
          value={search}
          onChangeText={(text) => setSearch(text)} // BEGIN: Fix for onChangeText
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default TherapistListScreen;