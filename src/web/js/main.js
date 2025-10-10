/**
 * 메인 애플리케이션 스크립트
 * 전체 시스템 초기화 및 이벤트 처리
 */

class RobotControlApp {
    constructor() {
        this.rosClient = window.rosClient;
        this.visualizationManager = window.visualizationManager;
        this.isInitialized = false;
        
        // 미리 정의된 위치들
        this.presetPositions = {
            home: { x: 0, y: 0, theta: 0 },
            a: { x: 2, y: 2, theta: 0 },
            b: { x: -2, y: 2, theta: Math.PI / 2 },
            c: { x: 0, y: -2, theta: Math.PI }
        };
        
        // 상태 관리
        this.systemStatus = {
            rosConnected: false,
            tfActive: false,
            messageCount: 0
        };
    }

    /**
     * 애플리케이션 초기화
     */
    async initialize() {
        try {
            console.log('로봇 관제 시스템을 초기화합니다...');
            
            // 시각화 시스템 초기화
            this.visualizationManager.initialize();
            
            // ROS 클라이언트 콜백 설정
            this.setupRosCallbacks();
            
            // UI 이벤트 핸들러 설정
            this.setupUIEventHandlers();
            
            // 상태 업데이트 타이머 시작
            this.startStatusUpdates();
            
            // ROS 연결 시도
            this.rosClient.connect();
            
            this.isInitialized = true;
            console.log('시스템 초기화 완료');
            
        } catch (error) {
            console.error('시스템 초기화 오류:', error);
            this.showError(`초기화 오류: ${error.message}`);
        }
    }

    /**
     * ROS 클라이언트 콜백 설정
     */
    setupRosCallbacks() {
        // 연결 상태 변경
        this.rosClient.setCallback('onConnectionChange', (status) => {
            this.updateConnectionStatus(status);
            this.systemStatus.rosConnected = status === '연결됨';
            
            if (this.systemStatus.rosConnected) {
                // 연결되면 시각화 시스템과 ROS 연결
                this.visualizationManager.connectToRos(this.rosClient);
            }
        });

        // 지도 업데이트
        this.rosClient.setCallback('onMapUpdate', (mapData) => {
            console.log('지도 업데이트 수신');
            // 시각화 매니저에서 자동으로 처리됨
        });

        // 로봇 포즈 업데이트
        this.rosClient.setCallback('onRobotPoseUpdate', (x, y, theta) => {
            this.visualizationManager.updateRobotPose(x, y, theta);
        });

        // 라이다 스캔 업데이트
        this.rosClient.setCallback('onLaserScanUpdate', (scanData) => {
            this.visualizationManager.updateLaserScan(scanData);
        });

        // 오도메트리 업데이트
        this.rosClient.setCallback('onOdometryUpdate', (odomData) => {
            this.updateVelocityDisplay(odomData);
        });

        // 오류 처리
        this.rosClient.setCallback('onError', (error) => {
            this.showError(error);
        });
    }

    /**
     * UI 이벤트 핸들러 설정
     */
    setupUIEventHandlers() {
        // 목표 지점 전송 버튼
        const sendGoalBtn = document.getElementById('send-goal-btn');
        if (sendGoalBtn) {
            sendGoalBtn.addEventListener('click', () => {
                this.sendGoalFromInputs();
            });
        }

        // 빠른 명령 버튼들
        const quickBtns = document.querySelectorAll('.quick-btn');
        quickBtns.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const action = event.target.dataset.action;
                this.executeQuickCommand(action);
            });
        });

        // 미리 정의된 위치 버튼들
        const presetBtns = document.querySelectorAll('.preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const position = event.target.dataset.position;
                this.goToPresetPosition(position);
            });
        });

        // 입력값 유효성 검사
        this.setupInputValidation();
    }

    /**
     * 입력값 유효성 검사 설정
     */
    setupInputValidation() {
        const inputs = ['goal-x', 'goal-y', 'goal-theta'];
        
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    this.validateInputs();
                });
            }
        });
    }

    /**
     * 입력값 유효성 검사
     */
    validateInputs() {
        const sendBtn = document.getElementById('send-goal-btn');
        const xInput = document.getElementById('goal-x');
        const yInput = document.getElementById('goal-y');
        const thetaInput = document.getElementById('goal-theta');

        const isValid = xInput.value !== '' && 
                       yInput.value !== '' && 
                       thetaInput.value !== '' &&
                       this.systemStatus.rosConnected;

        if (sendBtn) {
            sendBtn.disabled = !isValid;
        }
    }

    /**
     * 입력값으로부터 목표 지점 전송
     */
    sendGoalFromInputs() {
        const x = parseFloat(document.getElementById('goal-x').value);
        const y = parseFloat(document.getElementById('goal-y').value);
        const thetaDeg = parseFloat(document.getElementById('goal-theta').value);
        const theta = thetaDeg * Math.PI / 180;

        if (isNaN(x) || isNaN(y) || isNaN(theta)) {
            this.showError('유효하지 않은 좌표값입니다.');
            return;
        }

        this.rosClient.publishGoal(x, y, theta);
        this.showSuccess(`목표 지점 전송: (${x.toFixed(2)}, ${y.toFixed(2)}, ${thetaDeg.toFixed(1)}°)`);
    }

    /**
     * 빠른 명령 실행
     */
    executeQuickCommand(action) {
        const currentPose = this.rosClient.getCurrentPose();
        let targetX = currentPose.x;
        let targetY = currentPose.y;
        let targetTheta = currentPose.theta;

        const moveDistance = 1.0; // 1미터
        const rotateAngle = Math.PI / 2; // 90도

        switch (action) {
            case 'forward':
                targetX += moveDistance * Math.cos(currentPose.theta);
                targetY += moveDistance * Math.sin(currentPose.theta);
                break;
            case 'backward':
                targetX -= moveDistance * Math.cos(currentPose.theta);
                targetY -= moveDistance * Math.sin(currentPose.theta);
                break;
            case 'left':
                targetX -= moveDistance * Math.sin(currentPose.theta);
                targetY += moveDistance * Math.cos(currentPose.theta);
                break;
            case 'right':
                targetX += moveDistance * Math.sin(currentPose.theta);
                targetY -= moveDistance * Math.cos(currentPose.theta);
                break;
            case 'rotate-left':
                targetTheta += rotateAngle;
                break;
            case 'rotate-right':
                targetTheta -= rotateAngle;
                break;
            case 'stop':
                // 현재 위치로 목표 설정 (정지)
                break;
            default:
                console.warn(`알 수 없는 명령: ${action}`);
                return;
        }

        // 각도 정규화
        while (targetTheta > Math.PI) targetTheta -= 2 * Math.PI;
        while (targetTheta < -Math.PI) targetTheta += 2 * Math.PI;

        this.rosClient.publishGoal(targetX, targetY, targetTheta);
        console.log(`빠른 명령 실행: ${action}`);
    }

    /**
     * 미리 정의된 위치로 이동
     */
    goToPresetPosition(positionKey) {
        const position = this.presetPositions[positionKey];
        if (!position) {
            console.error(`알 수 없는 위치: ${positionKey}`);
            return;
        }

        this.rosClient.publishGoal(position.x, position.y, position.theta);
        this.showSuccess(`${positionKey.toUpperCase()} 위치로 이동 중...`);
    }

    /**
     * 연결 상태 업데이트
     */
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        const bridgeStatusElement = document.getElementById('bridge-status');

        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = this.getStatusClass(status);
        }

        if (bridgeStatusElement) {
            bridgeStatusElement.textContent = status;
            bridgeStatusElement.className = `status-indicator ${this.getStatusClass(status)}`;
        }

        // 연결 상태에 따른 UI 활성화/비활성화
        this.updateUIState(status === '연결됨');
    }

    /**
     * 상태에 따른 CSS 클래스 반환
     */
    getStatusClass(status) {
        if (status === '연결됨') return 'status-connected';
        if (status.includes('오류') || status.includes('실패')) return 'status-disconnected';
        return 'status-connecting';
    }

    /**
     * UI 상태 업데이트
     */
    updateUIState(connected) {
        const controls = document.querySelectorAll('.primary-btn, .quick-btn, .preset-btn');
        controls.forEach(control => {
            control.disabled = !connected;
        });

        this.validateInputs();
    }

    /**
     * 속도 표시 업데이트
     */
    updateVelocityDisplay(odomData) {
        const linear = odomData.twist.twist.linear;
        const angular = odomData.twist.twist.angular;

        const linearSpeed = Math.sqrt(linear.x * linear.x + linear.y * linear.y + linear.z * linear.z);
        const angularSpeed = Math.abs(angular.z);

        const linearElement = document.getElementById('linear-velocity');
        const angularElement = document.getElementById('angular-velocity');

        if (linearElement) {
            linearElement.textContent = `${linearSpeed.toFixed(2)} m/s`;
        }
        if (angularElement) {
            angularElement.textContent = `${angularSpeed.toFixed(2)} rad/s`;
        }
    }

    /**
     * 상태 업데이트 타이머 시작
     */
    startStatusUpdates() {
        setInterval(() => {
            this.updateSystemStatus();
        }, 1000);
    }

    /**
     * 시스템 상태 업데이트
     */
    updateSystemStatus() {
        // 업타임 업데이트
        const uptimeElement = document.getElementById('uptime');
        if (uptimeElement) {
            uptimeElement.textContent = this.rosClient.getUptime();
        }

        // 메시지 카운터 업데이트
        const messageCountElement = document.getElementById('message-count');
        if (messageCountElement) {
            messageCountElement.textContent = this.rosClient.getMessageCount();
        }

        // TF 상태 업데이트 (TF 클라이언트가 있으면 활성)
        const tfStatusElement = document.getElementById('tf-status');
        if (tfStatusElement) {
            const tfActive = this.rosClient.tfClient !== null;
            tfStatusElement.textContent = tfActive ? '활성' : '비활성';
            tfStatusElement.className = `status-indicator ${tfActive ? 'status-connected' : 'status-disconnected'}`;
        }
    }

    /**
     * 성공 메시지 표시
     */
    showSuccess(message) {
        console.log(`✅ ${message}`);
        // 향후 토스트 알림 구현 가능
    }

    /**
     * 오류 메시지 표시
     */
    showError(message) {
        console.error(`❌ ${message}`);
        // 향후 토스트 알림 구현 가능
    }

    /**
     * 애플리케이션 종료
     */
    shutdown() {
        console.log('시스템을 종료합니다...');
        this.rosClient.disconnect();
        this.visualizationManager.cleanup();
    }
}

// 전역 애플리케이션 인스턴스
let robotControlApp;

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    robotControlApp = new RobotControlApp();
    robotControlApp.initialize();
});

// 페이지 종료 시 정리
window.addEventListener('beforeunload', () => {
    if (robotControlApp) {
        robotControlApp.shutdown();
    }
});