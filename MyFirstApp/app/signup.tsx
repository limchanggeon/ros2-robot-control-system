import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList, // ★ 로딩 아이콘용 추가
  KeyboardAvoidingView,
  Modal, // ★ 키보드 회피용 추가
  Platform // ★ OS 구별용 추가
  ,





  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();

  // 상태 변수들
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [lab, setLab] = useState('');

  // ★ 로딩 상태 관리 (서버 통신 중인지 확인)
  const [isLoading, setIsLoading] = useState(false);

  // 모달 상태 관리
  const [isModalVisible, setModalVisible] = useState(false);

  // 강의실 데이터 생성
  const range1 = Array.from({ length: 37 }, (_, i) => (101 + i).toString());
  const range2 = Array.from({ length: 38 }, (_, i) => (301 + i).toString());
  const roomData = [...range1, ...range2];

  const SERVER_URL = 'http://192.168.11.25:8000/signup';

  // 회원가입 버튼 클릭 시 실행 (서버 통신 로직)
  const handleSignUp = async () => {
    // 1. 유효성 검사
    if (!id || !name || !password || !phone || !lab) {
      Alert.alert("알림", "모든 정보를 입력해주세요.");
      return;
    }

    // 2. 비밀번호 일치 확인
    if (password !== confirmPassword) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return;
    }

    // ★ 로딩 시작 (버튼 비활성화)
    setIsLoading(true);

    // 3. 서버로 보낼 데이터 준비
    const userData = {
      id: id,
      name: name,
      password: password,
      phone: phone,
      lab: lab
    };

    try {
      console.log("Sending data to:", SERVER_URL);

      // 4. FastAPI 서버로 POST 요청 전송
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        // 5. 성공 시
        Alert.alert(
          "회원가입 완료",
          "로그인 화면으로 이동합니다.",
          [{ text: "확인", onPress: () => router.push('/login') }]
        );
      } else {
        // 6. 실패 시
        Alert.alert("회원가입 실패", result.detail || "서버 오류가 발생했습니다.");
      }
    } catch (error) {
      // 7. 네트워크 연결 실패
      console.error("Network Error:", error);
      Alert.alert(
        "통신 오류",
        `서버와 연결할 수 없습니다.\nIP: ${SERVER_URL}\n같은 와이파이인지 확인해주세요.`
      );
    } finally {
      // ★ 통신이 성공하든 실패하든 로딩 종료
      setIsLoading(false);
    }
  };

  // 강의실 선택 함수
  const handleSelectRoom = (selectedRoom: string) => {
    setLab(selectedRoom);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>회원가입</Text>

          {/* 아이디 */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputInRow}
              placeholder="아이디"
              placeholderTextColor="#AAAAAA"
              value={id}
              onChangeText={setId}
              autoCapitalize="none"
              editable={!isLoading} // 로딩 중엔 입력 불가
            />
            <TouchableOpacity
              style={styles.checkButton}
              activeOpacity={0.7}
              onPress={() => Alert.alert("알림", "구현 예정입니다.")}
            >
              <Text style={styles.checkButtonText}>중복확인</Text>
            </TouchableOpacity>
          </View>

          {/* 이름 */}
          <TextInput
            style={styles.input}
            placeholder="이름"
            placeholderTextColor="#AAAAAA"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />

          {/* 비밀번호 */}
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor="#AAAAAA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          {/* 비밀번호 확인 */}
          <TextInput
            style={styles.input}
            placeholder="비밀번호 다시 입력하기"
            placeholderTextColor="#AAAAAA"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
          />

          {/* 휴대폰 번호 */}
          <TextInput
            style={styles.input}
            placeholder="휴대폰 번호"
            placeholderTextColor="#AAAAAA"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!isLoading}
          />

          {/* 강의실 선택 버튼 */}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => !isLoading && setModalVisible(true)}
          >
            <Text style={[styles.selectText, !lab && { color: '#AAAAAA' }]}>
              {lab ? `${lab}호` : "소속 연구실 / 강의실 (선택)"}
            </Text>
          </TouchableOpacity>

          {/* ★ 회원가입 버튼 (로딩 처리 추가) */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]} // 로딩 중엔 회색
            activeOpacity={0.8}
            onPress={handleSignUp}
            disabled={isLoading} // 로딩 중엔 클릭 방지
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>회원가입</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* 모달 */}
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
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3F3D56',
    marginBottom: 40,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 25,
  },
  inputInRow: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingLeft: 5,
  },
  checkButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  checkButtonText: {
    color: '#666666',
    fontSize: 13,
  },
  input: {
    width: '90%',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 25,
    fontSize: 16,
    paddingLeft: 5,
  },
  selectButton: {
    width: '90%',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 25,
    justifyContent: 'center',
    paddingLeft: 5,
  },
  selectText: {
    fontSize: 16,
    color: '#000000',
  },
  button: {
    backgroundColor: '#4966d5',
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  // ★ 로딩 중일 때 버튼 스타일 (회색)
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
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
    color: '#3F3D56',
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