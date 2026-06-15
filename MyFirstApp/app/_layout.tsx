// app/_layout.tsx
// 설정 파일
import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* 로그인/회원가입 화면들 */}
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="findID" />
            <Stack.Screen name="findPwd1" />
            <Stack.Screen name="findPwd2" />
            <Stack.Screen name="user_in" />
            <Stack.Screen name="user_info" />

            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
                name="order"
                options={{
                    presentation: 'modal', // 이 설정이 슬라이드 업/다운 애니메이션을 만듭니다.
                    headerShown: false      // 커스텀 헤더를 쓰므로 기본 헤더는 숨깁니다.
                }}
            />
        </Stack>
        
    );
}
