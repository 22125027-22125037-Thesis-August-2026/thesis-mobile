// src/screens/booking/TherapistListScreen.styles.ts

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  circleLarge: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#6C63FF',
    opacity: 0.2,
  },
  circleSmall: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6C63FF',
    opacity: 0.15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    zIndex: 1,
  },
  searchBar: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f8ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  specialty: {
    fontSize: 14,
    color: '#6C63FF',
    marginVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#444',
  },
  button: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});