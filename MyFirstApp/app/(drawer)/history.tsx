import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
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

// 배달 내역 데이터 타입 정의
interface HistoryItem {
    id: string;
    orderId: string;
    recipient: string;
    content: string;
    destination: string;
    date: string;
    status: 'completed' | 'delivering'; // 완료 vs 배달중
}

export default function HistoryScreen() {
    const navigation = useNavigation();

    // 더미 데이터 (스크롤 테스트를 위해 데이터를 여러 개 넣었습니다)
    const historyData: HistoryItem[] = [
        {
            id: '1',
            orderId: 'D1392048',
            recipient: '최서연',
            content: 'ex) 음식, 서류 등/ 주문 상세 내역',
            destination: '405',
            date: '2025 / 12 / 25 (시간 등)',
            status: 'completed',
        },
        {
            id: '2',
            orderId: 'D1392049',
            recipient: '김철수',
            content: '서류 봉투',
            destination: '302',
            date: '2025 / 12 / 25 (시간 등)',
            status: 'delivering',
        },
        {
            id: '3',
            orderId: 'D1392050',
            recipient: '이영희',
            content: '커피 2잔',
            destination: '501',
            date: '2025 / 12 / 24 (시간 등)',
            status: 'completed',
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />

            {/* 1. 헤더 영역 */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>History</Text>

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

            {/* 헤더 하단 구분선 */}
            <View style={styles.divider} />

            {/* 2. 스크롤 가능한 내역 리스트 */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {historyData.map((item) => (
                    <View key={item.id} style={styles.card}>

                        {/* 상태 뱃지 (오른쪽 상단) */}
                        <View style={styles.badgeContainer}>
                            <View style={[
                                styles.badge,
                                item.status === 'completed' ? styles.badgeCompleted : styles.badgeDelivering
                            ]}>
                                <Text style={[
                                    styles.badgeText,
                                    item.status === 'delivering' && styles.badgeTextDelivering // 배달중일 때 텍스트 색상 변경
                                ]}>
                                    {item.status === 'completed' ? '배달 완료' : '배달중'}
                                </Text>
                            </View>
                        </View>

                        {/* 정보 행들 */}
                        <InfoRow label="주문 ID" value={item.orderId} />
                        <InfoRow label="수령자 이름" value={item.recipient} />
                        <InfoRow label="주문 내용" value={item.content} />
                        <InfoRow label="배달 도착지" value={item.destination} />
                        <InfoRow label="주문 날짜" value={item.date} isLast={true} />

                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

// 반복되는 정보 행을 위한 컴포넌트
const InfoRow = ({ label, value, isLast }: { label: string, value: string, isLast?: boolean }) => (
    <View style={[styles.infoRow, isLast && { marginBottom: 0 }]}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={styles.infoValueContainer}>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    // 헤더 스타일
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#1b285c',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
    },
    iconButton: {
        padding: 0,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 25,
        marginBottom: 10,
    },
    // 스크롤 컨테이너
    scrollContainer: {
        paddingHorizontal: 25,
        paddingTop: 10,
        paddingBottom: 40,
    },
    // 카드 스타일
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        // 그림자 (선택사항)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    // 뱃지 스타일
    badgeContainer: {
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    badgeCompleted: {
        backgroundColor: '#4966d5', // 진한 파란색
    },
    badgeDelivering: {
        backgroundColor: '#becffe', // 연한 파란색
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    badgeTextDelivering: {
        color: '#4966d5', // 배달중일 때는 글씨를 진하게
    },
    // 정보 행 스타일
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoLabel: {
        width: 90,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1b285c',
    },
    infoValueContainer: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingBottom: 5,
    },
    infoValue: {
        fontSize: 15,
        color: '#888',
    },
});