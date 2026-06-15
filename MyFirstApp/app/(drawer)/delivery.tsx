import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ---------------------------------------------------------
// [중요] 서버 주소 설정 (윈도우 PC IP)
// ---------------------------------------------------------
const SERVER_URL = "http://192.168.100.30:8080";

interface FormField {
  id: string;
  label: string;
  placeholder: string;
  value: string;
}

export default function DeliveryScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // 1. 모달 상태 변수
  const [isModalVisible, setModalVisible] = useState(false);

  // 2. 강의실 데이터 생성 (D301 ~ D310)
  const roomData = Array.from({ length: 10 }, (_, i) => `D${301 + i}`);

  const [formFields, setFormFields] = useState<FormField[]>([
    { id: "recipientName", label: "수령자", placeholder: "수령자 이름 입력", value: "" },
    { id: "address", label: "주소", placeholder: "주소 선택", value: "" },
    { id: "orderItems", label: "주문 물품", placeholder: "ex) 음식, 서류 등 / 주문 상세 내역", value: "" },
  ]);

  const [orderDetails, setOrderDetails] = useState<string>("");

  const handleFieldChange = (id: string, value: string) => {
    setFormFields((prevFields) =>
      prevFields.map((field) => field.id === id ? { ...field, value } : field)
    );
  };

  // 3. 주소 선택 핸들러
  const handleSelectRoom = (selectedRoom: string) => {
    handleFieldChange('address', selectedRoom);
    setModalVisible(false);
  };

  // 4. 입력 검증 및 주문 접수 (서버 전송 주석 처리)
  const handleSubmit = () => {
    // 입력된 값 가져오기
    const recipientName = formFields.find(f => f.id === 'recipientName')?.value || "";
    const address = formFields.find(f => f.id === 'address')?.value || "";
    const orderItems = formFields.find(f => f.id === 'orderItems')?.value || "";

    // 유효성 검사 (상세 내역은 비어있어도 무방함)
    if (recipientName.trim() === "" || address.trim() === "" || orderItems.trim() === "") {
      Alert.alert("알림", "수령자 이름, 주소, 주문 물품은 필수 입력 항목입니다.");
      return;
    }

    /* ==== [서버 전송 로직 주석 처리] ====
    try {
      console.log(`[주문 전송] 대상 서버: ${SERVER_URL}`);
      const finalMenuName = orderDetails.trim()
        ? `${orderItems} (${orderDetails})`
        : orderItems;
      const finalUserId = `${recipientName} [${address}]`;

      const response = await fetch(`${SERVER_URL}/app/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menu: finalMenuName,
          count: 1,
          user_id: finalUserId
        }),
      });

      const json = await response.json();

      if (response.ok) {
        Alert.alert("주문 접수 완료", "서버에 주문이 정상적으로 등록되었습니다.", [
          { text: "확인", onPress: () => router.replace('/(drawer)/home') }
        ]);
      } else {
        Alert.alert("오류", "서버 응답 실패: " + (json.detail || "알 수 없는 오류"));
      }

    } catch (error) {
      console.error("서버 연결 실패:", error);
      Alert.alert(
        "연결 실패",
        "서버와 연결할 수 없습니다.\n1. PC IP가 192.168.100.30 인지 확인하세요.\n2. PC 방화벽을 잠시 끄고 시도해보세요."
      );
    }
    ==================================== */

    // 검증 통과 시 order.tsx(MyPage)로 파라미터 전달과 함께 이동
    // (※ 만약 order.tsx 파일 경로가 다르면 pathname 부분을 수정해주세요)
    router.push({
      pathname: '/(drawer)/order',
      params: {
        recipientName: recipientName,
        address: address,
        orderItems: orderItems,
        orderDetails: orderDetails,
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>

          {/* 1. 헤더 영역 */}
          <View style={styles.header}>
            <Text style={styles.headerLogo}>Delivery Order</Text>

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

          <View style={styles.contentWrapper}>
            {/* 2. 타이틀 (아이콘 + 텍스트) */}
            <View style={styles.titleContainer}>
              <Ionicons name="cart-outline" size={24} color="#1b285c" />
              <Text style={styles.titleText}>주문하기</Text>
            </View>

            {/* 3. 입력 폼 영역 */}
            <View style={styles.formContainer}>
              <View style={styles.fieldsContainer}>
                {formFields.map((field) => (
                  <View key={field.id} style={styles.inputRow}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.labelText}>{field.label}</Text>
                    </View>

                    {/* 주소 필드는 버튼으로, 나머지는 입력창으로 표시 */}
                    {field.id === 'address' ? (
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setModalVisible(true)}
                      >
                        <Text style={[styles.inputText, { color: '#333' }]}>
                          {field.value ? field.value : field.placeholder}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TextInput
                        style={styles.input}
                        value={field.value}
                        onChangeText={(text) => handleFieldChange(field.id, text)}
                        placeholder={field.placeholder}
                        placeholderTextColor="#999"
                      />
                    )}
                  </View>
                ))}
              </View>

              {/* 상세 내용 (회색 박스 스타일) */}
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  value={orderDetails}
                  onChangeText={setOrderDetails}
                  placeholder="주문 내용"
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* 4. 주문 접수 버튼 */}
              <TouchableOpacity
                style={styles.submitButton}
                activeOpacity={0.8}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>주문 접수</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* 5. 주소 선택 모달 추가 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>배달 장소 선택</Text>

            <View style={styles.listContainer}>
              <FlatList
                data={roomData}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSelectRoom(item)}
                  >
                    <Text style={styles.modalItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={true}
              />
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  container: { 
    paddingBottom: 40 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    paddingVertical: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#EFEFEF' 
  },
  headerLogo: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#1b285c' 
  },
  headerIcons: { 
    flexDirection: 'row', 
    gap: 15, 
    alignItems: 'center' },
  iconButton: { 
    padding: 0 
  },
  contentWrapper: { 
    paddingHorizontal: 25, 
    paddingTop: 30 
  },
  titleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 30, 
    gap: 8 
  },
  titleText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1b285c' 
  },
  formContainer: { 
    width: '100%' 
  },
  fieldsContainer: { 
    marginBottom: 30 
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  labelContainer: { 
    width: 100 
  },
  labelText: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#1b285c' 
  },
  input: { 
    flex: 1, 
    fontSize: 15, 
    color: '#333', 
    paddingVertical: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#D1D1D1' 
  },
  selectButton: { 
    flex: 1, 
    paddingVertical: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#D1D1D1', 
    justifyContent: 'center' 
  },
  inputText: { 
    fontSize: 15, 
    color: '#333' 
  },
  textAreaContainer: { 
    backgroundColor: '#F7F7F7', 
    borderRadius: 15, 
    padding: 20, 
    marginBottom: 40, 
    height: 150, 
    borderWidth: 1, 
    borderColor: '#E0E0E0' 
  },
  textArea: { 
    flex: 1, 
    fontSize: 15, 
    color: '#333' 
  },
  submitButton: { 
    backgroundColor: '#4966d5', 
    height: 55, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: "#4966d5", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 5 
  },
  submitButtonText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: { 
    width: '80%', 
    height: '60%', 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center', 
    elevation: 5 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    color: '#1b285c' 
  },
  listContainer: { 
    flex: 1, 
    width: '100%', 
    marginBottom: 15 
  },
  modalItem: { 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0', 
    alignItems: 'center' 
  },
  modalItemText: { 
    fontSize: 16, 
    color: '#333' 
  },
  modalCloseButton: { 
    backgroundColor: '#4966d5', 
    paddingHorizontal: 30, 
    paddingVertical: 10, 
    borderRadius: 20 
  },
  modalCloseText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  }
});