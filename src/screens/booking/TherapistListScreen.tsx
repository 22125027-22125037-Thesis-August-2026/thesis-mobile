// src/screens/booking/TherapistListScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '@/navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { getTherapists, Therapist } from '@/api';
import { CustomInput, AppText } from '@/components';
import { COLORS } from '@/theme';
import styles from '@/screens/booking/TherapistListScreen.styles';

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
        <AppText style={styles.therapistLabel}>Chuyên gia</AppText>
        <AppText style={styles.name}>{item.name}</AppText>
        <AppText style={styles.specialty}>{item.specialty}</AppText>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={COLORS.ratingStar} />
          <AppText style={styles.rating}>{item.rating.toFixed(1)}</AppText>
        </View>
        <Pressable
          style={styles.bookButton}
          onPress={() => navigation.navigate('TherapistDetails', { id: item.id })}
        >
          <AppText style={styles.bookButtonText}>Đặt lịch</AppText>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.circleLarge} />
        <View style={styles.circleSmall} />
        <View style={styles.headerTopRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={18} color={COLORS.white} />
          </Pressable>
          <AppText style={styles.headerTitle}>Tìm Chuyên Gia</AppText>
        </View>
        <AppText style={styles.headerSubtitle}>
          Kết nối với các nhà tâm lý học được chứng nhận
        </AppText>
      </View>

      <View style={styles.searchBar}>
        <CustomInput
          iconName="search"
          placeholder="Tìm kiếm theo tên hoặc chuyên môn"
          value={search}
          onChangeText={(text) => setSearch(text)}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default TherapistListScreen;
