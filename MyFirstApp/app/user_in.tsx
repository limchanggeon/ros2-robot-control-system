import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PasswordCheckScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (password.trim() === "") {
      Alert.alert("알림", "비밀번호를 입력해주세요.");
      return;
    }

    // 비밀번호 검증 로직 (생략)
    console.log("Form submitted with password:", password);

    Alert.alert("인증 성공", "본인 확인이 완료되었습니다.", [
      {
        text: "확인",
        onPress: () => {
          router.replace('/user_info');
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>사용자 본인확인</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor="#ccc"
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>인증하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  header: {
    marginBottom: 50,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 150,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b285c',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 30,
  },
  inputContainer: {
    width: '100%',
    gap: 10,
  },
  label: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
    paddingLeft: 5,
  },
  input: {
    width: '100%',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#1b285c',
    fontSize: 18,
    paddingVertical: 5,
    paddingLeft: 5,
    color: '#000',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4966d5',
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,

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
    color: '#e3eafe',
    fontSize: 18,
    fontWeight: 'bold',
  },
});