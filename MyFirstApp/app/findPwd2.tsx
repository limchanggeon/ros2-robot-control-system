import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 비밀번호 변경 버튼 클릭 시 실행
  const handleChangePassword = () => {
    // 간단한 유효성 검사 (입력 확인 및 일치 여부)
    if (!newPassword || !confirmPassword) {
      Alert.alert("알림", "비밀번호를 모두 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return;
    }

    Alert.alert(
      "비밀번호 변경",
      "비밀번호 변경이 완료되었습니다. 로그인 페이지로 이동합니다.",
      [
        { text: "확인", onPress: () => router.push('/login') } // 로그인 페이지로 이동
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>

        {/* 상단 타이틀 */}
        <Text style={styles.title}>비밀번호 변경</Text>

        {/* 입력 폼 영역 */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호 입력"
              placeholderTextColor="#AAAAAA"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true} // 비밀번호 숨김 처리
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호 재입력"
              placeholderTextColor="#AAAAAA"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true} // 비밀번호 숨김 처리
            />
          </View>
        </View>

        {/* 하단 버튼 */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleChangePassword}
        >
          <Text style={styles.buttonText}>비밀번호 변경하기</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// 스타일 시트
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 62,
  },
  title: {
    fontSize: 24, // CSS의 --h5-b 폰트 사이즈에 맞게 적절히 조정 가능
    fontWeight: 'bold',
    color: '#1B285C',
    marginBottom: 50,
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 32, // CSS의 .btn-2 height 값 반영
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // SVG 벡터(밑줄) 대체
    fontSize: 16,
    paddingLeft: 5,
    paddingBottom: 5,
    color: '#000000',
  },
  button: {
    backgroundColor: '#4966d5', // 기준 포맷과 동일한 버튼 색상 적용
    height: 48, // CSS의 .btn-4 height 값 반영
    borderRadius: 30,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});