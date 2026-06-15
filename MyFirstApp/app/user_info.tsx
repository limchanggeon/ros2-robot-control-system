import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert, // 추가
  FlatList // 추가
  ,
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

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'password' | 'tel';
  placeholder: string;
}

export default function UserInfoChangeScreen() {
  const router = useRouter();

  // 1. 모달 상태 관리
  const [isModalVisible, setModalVisible] = useState(false);

  // 2. 강의실 데이터 생성 (101~137, 301~338)
  const roomData = [
    ...Array.from({ length: 37 }, (_, i) => (101 + i).toString()),
    ...Array.from({ length: 38 }, (_, i) => (301 + i).toString())
  ];

  const formFieldsGroup1: FormField[] = [
    { id: "name", label: "이름", type: "text", placeholder: "이름을 입력하세요" },
    { id: "password", label: "비밀번호", type: "password", placeholder: "비밀번호를 입력하세요" },
    { id: "passwordConfirm", label: "비밀번호 다시 입력하기", type: "password", placeholder: "비밀번호를 다시 입력하세요" },
  ];

  const formFieldsGroup2: FormField[] = [
    { id: "phone", label: "휴대폰 번호", type: "tel", placeholder: "휴대폰 번호를 입력하세요" },
    { id: "address", label: "소속 연구실 / 강의실 (주소)", type: "text", placeholder: "주소를 선택하세요" },
  ];

  const [formData, setFormData] = useState<Record<string, string>>({
    name: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    address: "",
  });

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // 3. 강의실 선택 핸들러
  const handleSelectRoom = (selectedRoom: string) => {
    handleInputChange("address", selectedRoom);
    setModalVisible(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.password) {
      Alert.alert("알림", "필수 정보를 모두 입력해주세요.");
      return;
    }

    console.log("Form submitted:", formData);

    Alert.alert(
      "저장 완료",
      "사용자 정보가 변경되었습니다.",
      [
        {
          text: "확인",
          onPress: () => {
            router.replace('/(drawer)/home');
          }
        }
      ]
    );
  };

  // 4. 입력 필드 렌더링 함수 (수정됨)
  const renderFields = (fields: FormField[]) => {
    return fields.map((field) => (
      <View key={field.id} style={styles.inputGroup}>
        <Text style={styles.label}>{field.label}</Text>

        {/* 'address' 필드일 경우 버튼으로 표시, 아니면 입력창 표시 */}
        {field.id === 'address' ? (
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[
              styles.inputText,
              !formData[field.id] && { color: '#CCCCCC' }
            ]}>
              {formData[field.id] ? `${formData[field.id]}호` : field.placeholder}
            </Text>
          </TouchableOpacity>
        ) : (
          <TextInput
            style={styles.input}
            value={formData[field.id]}
            onChangeText={(text) => handleInputChange(field.id, text)}
            placeholder={field.placeholder}
            placeholderTextColor="#CCCCCC"
            secureTextEntry={field.type === 'password'}
            keyboardType={field.type === 'tel' ? 'phone-pad' : 'default'}
            autoCapitalize="none"
          />
        )}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>

          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>사용자 정보 변경</Text>
          </View>

          {/* 폼 그룹 1 */}
          <View style={styles.section}>
            {renderFields(formFieldsGroup1)}
          </View>

          {/* 폼 그룹 2 */}
          <View style={styles.section}>
            {renderFields(formFieldsGroup2)}
          </View>

          {/* 저장 버튼 */}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>사용자 정보 저장</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* 5. 강의실 선택 모달 추가 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>강의실 선택</Text>

            <View style={styles.listContainer}>
              <FlatList
                data={roomData}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSelectRoom(item)}
                  >
                    <Text style={styles.modalItemText}>{item}호</Text>
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
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    alignItems: 'center',
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b285c',
  },
  section: {
    width: '100%',
    marginBottom: 30,
    gap: 20,
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
    paddingLeft: 4,
  },
  input: {
    width: '100%',
    height: 45,
    fontSize: 16,
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 5,
  },
  // 선택 버튼 스타일 (input과 동일하게 보이도록 설정)
  selectButton: {
    width: '100%',
    height: 45,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    justifyContent: 'center',
    paddingBottom: 5,
  },
  inputText: {
    fontSize: 16,
    color: '#000000',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4966d5',
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonText: {
    color: '#e3eafe',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    height: '60%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1b285c',
  },
  listContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 15,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    backgroundColor: '#4966d5',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});