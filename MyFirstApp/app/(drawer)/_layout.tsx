import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function CustomDrawerContent(props: any) {
    const router = useRouter();

    const [modalVisible, setModalVisible] = useState(false);

    const handleConfirmLogout = () => {
        setModalVisible(false);
        router.replace('/');
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>

            {/* --- 로그아웃 모달 (Modal) --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>로그아웃</Text>
                        <Text style={styles.modalMessage}>로그아웃 하시겠습니까?</Text>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleConfirmLogout}
                            >
                                <Text style={styles.confirmButtonText}>확인</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>취소</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {/* 메뉴창 헤더 */}
            <View style={styles.drawerHeader}>
                <TouchableOpacity
                    onPress={() => props.navigation.toggleDrawer()}
                    style={styles.closeButton}
                >
                    <Ionicons name="menu" size={30} color="#1b285c" />
                </TouchableOpacity>

                <Text style={styles.drawerTitle}>Menu</Text>
            </View>

            {/* 메뉴 리스트 */}
            <View style={styles.drawerList}>
                <DrawerItemList {...props} />
            </View>

            {/* 하단 로그아웃 버튼 */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
                <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
        </DrawerContentScrollView>
    );
}

export default function DrawerLayout() {
    return (
        <Drawer
            screenOptions={{
                headerShown: false,
                drawerPosition: 'right',
                drawerType: 'front',
                drawerStyle: {
                    width: '80%',
                    backgroundColor: '#fff',
                },
                swipeEnabled: false,
            }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            <Drawer.Screen
                name="home"
                options={{
                    drawerLabel: 'Home', headerShown: false,
                    drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />
                }}
            />

            <Drawer.Screen
                name="delivery"
                options={{
                    drawerLabel: 'Delivery Oreder',
                    drawerIcon: ({ color }) => <Ionicons name="cart-outline" size={22} color={color} />
                }}
            />

            <Drawer.Screen
                name="qr_code"
                options={{
                    drawerLabel: 'QR Code',
                    drawerIcon: ({ color }) => <Ionicons name="qr-code-outline" size={22} color={color} />
                }}
            />

            <Drawer.Screen
                name="history"
                options={{
                    drawerLabel: 'History',
                    drawerIcon: ({ color }) => <Ionicons name="list-outline" size={22} color={color} />
                }}
            />

            <Drawer.Screen name="password-check" options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="user_info" options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="user_change" options={{ drawerItemStyle: { display: 'none' } }} />

            {/* order 화면 설정: 메뉴에서 숨기고 헤더 없애기 */}
            <Drawer.Screen
                name="order"
                options={{
                    drawerItemStyle: { display: 'none' }, // 서랍 메뉴에서 안 보이게 숨김
                    headerShown: false // 커스텀 화살표 헤더를 위해 기본 헤더 숨김
                }}
            />
        </Drawer>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        height: 100,
        backgroundColor: '#F5F7FA',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    closeButton: {
        padding: 5,
        marginRight: 15,
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1b285c',
    },
    drawerList: {
        flex: 1,
        paddingTop: 10,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        marginBottom: 20,
    },
    logoutText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#FF6B6B',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1b285c',
    },
    modalMessage: {
        fontSize: 16,
        color: '#666',
        marginBottom: 25,
        textAlign: 'center',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        backgroundColor: '#4966d5',
    },
    cancelButton: {
        backgroundColor: '#becffe',
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButtonText: {
        color: '#33499e',
        fontWeight: 'bold',
        fontSize: 16,
    },
});