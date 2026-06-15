import { Feather, Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function QRCodeScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* 헤더 영역 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QR code</Text>

        <View style={styles.headerIcons}>

          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.iconButton}
          >
            {/* 다른 화면과 통일성을 위해 Ionicons menu-outline 사용 */}
            <Ionicons name="menu-outline" size={24} color="#2c3e50" />
          </TouchableOpacity>

        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        <Text style={styles.instructionText}>
          배달로봇에게 해당 QR코드를 인식시켜 주세요
        </Text>

        <View style={styles.qrContainer}>
          {/* QR 코드 자리 */}
          <Feather name="maximize" size={100} color="#ccc" />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>주문 ID</Text>
            <View style={styles.valueWrapper}>
              <Text style={styles.valueText}>Order-12345</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>주문 상태</Text>
            <View style={styles.valueWrapper}>
              <Text style={styles.valueText}>대기중</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a237e'
  },
  // 아이콘 배치 스타일 추가
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15, // 아이콘 사이 간격
  },
  iconButton: {
    padding: 5, // 터치 영역 확보
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '90%',
    alignSelf: 'center'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20
  },
  instructionText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center'
  },
  qrContainer: {
    width: width * 0.85,
    height: width * 0.85,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoSection: {
    width: '100%',
    paddingHorizontal: 10
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    width: 80
  },
  valueWrapper: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#bdbdbd',
    paddingBottom: 5
  },
  valueText: {
    fontSize: 16,
    color: '#757575'
  },
});