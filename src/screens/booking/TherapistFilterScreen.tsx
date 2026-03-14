// src/screens/booking/TherapistFilterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';
import styles from './TherapistFilterScreen.styles';
import { RootStackParamList } from '../../navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from '../../components/CustomButton';

const SPECIALTIES = [
  'Tâm lý học lâm sàng',
  'Tham vấn học đường',
  'Tâm lý trẻ em',
  'Tâm lý người lớn',
  'Trị liệu gia đình',
  'Trầm cảm',
  'Lo âu',
  'Stress',
];
const YEARS = ['1-3', '4-7', '8+'];
const GENDERS = ['Nam', 'Nữ', 'Khác'];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TherapistFilter'>;

const TherapistFilterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const handleSpecialtyPress = (item: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleYearPress = (item: string) => {
    setSelectedYear(item === selectedYear ? null : item);
  };

  const handleGenderPress = (item: string) => {
    setSelectedGender(item === selectedGender ? null : item);
  };

  const resetSpecialties = () => setSelectedSpecialties([]);
  const resetYear = () => setSelectedYear(null);
  const resetGender = () => setSelectedGender(null);

  const handleSubmit = () => {
    navigation.navigate('TherapistDetails', { id: '1' });
  };

  const renderChips = (
    options: string[],
    selected: string[] | string | null,
    onPress: (item: string) => void,
    multi?: boolean,
  ) => (
    <View style={styles.chipContainer}>
      {options.map((item) => {
        const isSelected = multi
          ? Array.isArray(selected) && selected.includes(item)
          : selected === item;
        return (
          <Text
            key={item}
            style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
            onPress={() => onPress(item)}
          >
            {item}
          </Text>
        );
      })}
    </View>
  );

  const renderResetButton = (onPress: () => void) => (
    <TouchableOpacity style={styles.resetBtn} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name="close-circle" size={16} color={COLORS.primary} />
      <Text style={styles.resetBtnText}>Reset</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Curved Green Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setShowUpdateModal(true)}>
            <Text style={styles.switchLink}>Tôi muốn đổi chuyên gia</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.brandText}>uMatter</Text>
        <Text style={styles.subHeader}>
          Tùy chỉnh mong muốn về chuyên gia của bạn
        </Text>
        <Image
          source={require('../../assets/booking/doctor.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      {/* Scrollable Filter Content with Leaf Background */}
      <ImageBackground
        source={require('../../assets/booking/leaf_bg.png')}
        style={styles.leafBackground}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Specialty Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Chuyên môn</Text>
              {renderResetButton(resetSpecialties)}
            </View>
            {renderChips(SPECIALTIES, selectedSpecialties, handleSpecialtyPress, true)}
          </View>

          {/* Years of Experience Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Số năm kinh nghiệm</Text>
              {renderResetButton(resetYear)}
            </View>
            {renderChips(YEARS, selectedYear, handleYearPress)}
          </View>

          {/* Gender Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Giới tính</Text>
              {renderResetButton(resetGender)}
            </View>
            {renderChips(GENDERS, selectedGender, handleGenderPress)}
          </View>
        </ScrollView>
      </ImageBackground>

      {/* Update Info Modal */}
      <Modal
        visible={showUpdateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Bạn có muốn cập nhật thông tin mới của mình trong bảng câu hỏi ghép
              nối chuyên gia trị liệu không?
            </Text>
            <TouchableOpacity
              style={styles.modalBtnOutline}
              onPress={() => setShowUpdateModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalBtnOutlineText}>
                Không, thông tin trong đó vẫn đúng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnPrimary}
              onPress={() => {
                setShowUpdateModal(false);
                navigation.navigate('MatchingForm');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.modalBtnPrimaryText}>
                Có, tôi muốn thay đổi 1 vài thông tin
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Footer Button - Green Pill */}
      <View style={styles.footer}>
        <CustomButton title="Trò chuyện với chuyên gia" onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default TherapistFilterScreen;
