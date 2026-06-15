import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'; // [수정] useFocusEffect 추가
import React, { useCallback, useState } from 'react'; // [수정] useCallback 추가
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [screenVisible, setScreenVisible] = useState(true);
  const [cancelPopupVisible, setCancelPopupVisible] = useState(false);

  // [추가] 화면에 들어올 때마다(Focus 될 때마다) 실행되는 코드
  useFocusEffect(
    useCallback(() => {
      setScreenVisible(true); // 들어올 때 항상 보이게 설정
    }, [])
  );

  const recipientName = (params.recipientName as string) || "미입력";
  const address = (params.address as string) || "미입력";
  const orderItems = (params.orderItems as string) || "미입력";
  const orderDetails = (params.orderDetails as string) || "없음";

  const orderData = [
    { label: "주문 ID", value: "D1392048" },
    { label: "수령자", value: recipientName },
    { label: "배달 주소", value: address },
    { label: "주문 물품", value: orderItems },
    { label: "배송 상태", value: "배송 대기중" },
    { label: "주문 내역", value: orderDetails },
  ];

  // 닫을 때 애니메이션을 보여주고 나서 뒤로 가기 실행
  const handleCloseScreen = () => {
    setScreenVisible(false); // 모달이 아래로 내려가기 시작함
    setTimeout(() => {
      router.back(); // 애니메이션 끝난 뒤 실제로 뒤로 감
    }, 250); // 애니메이션 시간(기본 약 300ms)보다 약간 넉넉하게 설정
  };

  return (
    // transparent={true}로 설정해야 뒤로 갈 때 배경이 자연스럽습니다.
    <Modal
      animationType="slide"
      transparent={true}
      visible={screenVisible}
      onRequestClose={handleCloseScreen}
    >
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCloseScreen} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#1b285c" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>주문 상세</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#ccc" />
              </View>

              <View style={styles.infoContainer}>
                {orderData.map((field, index) => (
                  <View key={index} style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{field.label}</Text>
                    <Text style={styles.infoValue}>{field.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.bottomButtons}>
              <TouchableOpacity
                style={[styles.roundButton, styles.blueButton]}
                onPress={() => {
                  setScreenVisible(false);
                  setTimeout(() => router.push('/(drawer)/qr_code'), 250);
                }}
              >
                <Text style={styles.blueButtonText}>물품 수령</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roundButton, styles.outlineButton]}
                onPress={() => setCancelPopupVisible(true)}
              >
                <Text style={styles.outlineButtonText}>주문 취소</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {cancelPopupVisible && (
            <View style={styles.absoluteOverlay}>
              <View style={styles.popupContainer}>
                <Text style={styles.popupTitle}>주문 취소</Text>
                <Text style={styles.popupMessage}>정말 주문을 취소하시겠습니까?</Text>
                <View style={styles.popupButtonContainer}>
                  <TouchableOpacity
                    style={[styles.popupButton, styles.confirmButton]}
                    onPress={() => {
                      setCancelPopupVisible(false);
                      setScreenVisible(false);
                      setTimeout(() => router.push('/(drawer)/home'), 250);
                    }}
                  >
                    <Text style={styles.confirmButtonText}>예</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.popupButton, styles.cancelButton]}
                    onPress={() => setCancelPopupVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>아니오</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// styles는 이전과 동일하게 유지...
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1b285c' },
  headerSpacer: { width: 38 },
  container: { paddingHorizontal: 20, paddingBottom: 40, gap: 20 },
  card: { backgroundColor: '#F7F7F7', borderRadius: 20, padding: 25, gap: 25 },
  imagePlaceholder: { height: 180, backgroundColor: '#EAEAEA', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { gap: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { width: 90, fontSize: 16, fontWeight: 'bold', color: '#1b285c' },
  infoValue: { fontSize: 16, color: '#555', flex: 1 },
  bottomButtons: { gap: 15, marginTop: 10 },
  roundButton: { height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  blueButton: { backgroundColor: '#4966d5' },
  blueButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  outlineButton: { backgroundColor: '#F7F7F7', borderWidth: 1, borderColor: '#1b285c' },
  outlineButtonText: { color: '#1b285c', fontSize: 18, fontWeight: 'bold' },
  absoluteOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  popupContainer: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center' },
  popupTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#1b285c' },
  popupMessage: { fontSize: 16, color: '#666', marginBottom: 25, textAlign: 'center' },
  popupButtonContainer: { flexDirection: 'row', width: '100%', gap: 10 },
  popupButton: { flex: 1, borderRadius: 25, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  confirmButton: { backgroundColor: '#4966d5' },
  cancelButton: { backgroundColor: '#becffe' },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelButtonText: { color: '#33499e', fontWeight: 'bold', fontSize: 16 }
});