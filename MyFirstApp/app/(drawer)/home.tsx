import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileField {
  label: string;
  value: string;
}

export default function Home() {
  const router = useRouter();
  const navigation = useNavigation();

  const profileData: ProfileField[] = [
    { label: "이름", value: "최서연" },
    { label: "아이디", value: "chltjdus" },
    { label: "전화번호", value: "010-0000-0000" },
    { label: "주소", value: "405" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>

        {/* 1. 헤더 영역 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#1b285c" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Ionicons name="menu-outline" size={28} color="#1b285c" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 2. 빠른 주문 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="lightning-bolt-outline" size={22} color="#1b285c" />
            <Text style={styles.sectionTitle}>빠른 주문</Text>
          </View>
          <View style={styles.quickOrderButtons}>
            <TouchableOpacity
              style={[styles.roundButton, styles.blueButton]}
              onPress={() => router.push('/delivery')}
            >
              <Text style={styles.blueButtonText}>주문하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roundButton, styles.lightBlueButton]}
              onPress={() => router.push('/qr_code')}
            >
              <Text style={styles.lightBlueButtonText}>QR 보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. 프로필 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="person-outline" size={22} color="#1b285c" />
            <Text style={styles.sectionTitle}>프로필</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.profileInfoContainer}>
              {profileData.map((field, index) => (
                <View key={index} style={styles.profileRow}>
                  <Text style={styles.profileLabel}>{field.label}</Text>
                  <Text style={styles.profileValue}>{field.value}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.push('/user_in')}
            >
              <Text style={styles.outlineButtonText}>내 정보 변경</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. 현재 주문 섹션 (수정됨) */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="cart-outline" size={22} color="#1b285c" />
            <Text style={styles.sectionTitle}>현재 주문</Text>
          </View>

          {/* 카드를 TouchableOpacity로 감싸서 클릭 시 order로 이동하게 변경 */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push('/order')}
          >
            <View style={styles.orderCardContent}>
              <Text style={styles.orderActiveText}>진행 중인 주문 확인하기 (D1392048)</Text>
              <Ionicons name="chevron-forward" size={20} color="#1b285c" />
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20, paddingBottom: 15, backgroundColor: '#fff' },
  headerTitle: { fontSize: 34, fontWeight: '800', color: '#1b285c' },
  headerIcons: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  iconButton: { padding: 0 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 25, marginBottom: 20 },
  section: { marginBottom: 35, paddingHorizontal: 25 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 6 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b285c' },
  quickOrderButtons: { flexDirection: 'row', gap: 15 },
  roundButton: { flex: 1, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  blueButton: { backgroundColor: '#4966d5' },
  lightBlueButton: { backgroundColor: '#becffe' },
  blueButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  lightBlueButtonText: { color: '#33499e', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#F7F7F7', borderRadius: 20, padding: 25 },
  profileInfoContainer: { marginBottom: 20, gap: 12 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileLabel: { width: 90, fontSize: 15, fontWeight: 'bold', color: '#1b285c' },
  profileValue: { fontSize: 15, color: '#888' },
  outlineButton: { height: 45, borderRadius: 25, borderWidth: 1, borderColor: '#1b285c', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  outlineButtonText: { color: '#1b285c', fontSize: 15, fontWeight: '600' },
  orderCardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderActiveText: { color: '#1b285c', fontSize: 15, fontWeight: 'bold' },
});