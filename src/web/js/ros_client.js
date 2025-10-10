/**
 * ROS 2 클라이언트 모듈
 * ROS Bridge를 통한 ROS 2 통신 관리
 */

class RosClient {
    constructor() {
        this.ros = null;
        this.tfClient = null;
        this.subscribers = new Map();
        this.publishers = new Map();
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        
        // 콜백 함수들
        this.callbacks = {
            onConnectionChange: null,
            onMapUpdate: null,
            onRobotPoseUpdate: null,
            onLaserScanUpdate: null,
            onOdometryUpdate: null,
            onError: null
        };
        
        // 현재 상태
        this.currentPose = { x: 0, y: 0, theta: 0 };
        this.messageCount = 0;
        this.startTime = Date.now();
    }

    /**
     * ROS Bridge 서버에 연결
     * @param {string} url - WebSocket URL (기본값: ws://localhost:9090)
     */
    connect(url = 'ws://localhost:9090') {
        try {
            this.ros = new ROSLIB.Ros({
                url: url
            });

            // 연결 이벤트 핸들러
            this.ros.on('connection', () => {
                console.log('ROS Bridge 서버에 연결되었습니다.');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.notifyConnectionChange('연결됨');
                this.initializeSubscribers();
                this.initializePublishers();
            });

            this.ros.on('error', (error) => {
                console.error('ROS Bridge 연결 오류:', error);
                this.isConnected = false;
                this.notifyConnectionChange('연결 오류');
                this.notifyError(`연결 오류: ${error.message || error}`);
                this.scheduleReconnect();
            });

            this.ros.on('close', () => {
                console.log('ROS Bridge 연결이 닫혔습니다.');
                this.isConnected = false;
                this.notifyConnectionChange('연결 끊김');
                this.scheduleReconnect();
            });

        } catch (error) {
            console.error('ROS 클라이언트 초기화 오류:', error);
            this.notifyError(`초기화 오류: ${error.message}`);
        }
    }

    /**
     * 재연결 스케줄링
     */
    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`${this.reconnectInterval/1000}초 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.notifyConnectionChange('재연결 중...');
                this.connect();
            }, this.reconnectInterval);
        } else {
            console.error('최대 재연결 시도 횟수에 도달했습니다.');
            this.notifyConnectionChange('연결 실패');
        }
    }

    /**
     * 구독자들 초기화
     */
    initializeSubscribers() {
        // 지도 구독
        this.createSubscriber('/map', 'nav_msgs/OccupancyGrid', (message) => {
            console.log('지도 데이터 수신');
            this.messageCount++;
            if (this.callbacks.onMapUpdate) {
                this.callbacks.onMapUpdate(message);
            }
        }, {
            qos: {
                reliability: 'reliable',
                durability: 'transient_local'
            }
        });

        // 오도메트리 구독
        this.createSubscriber('/odom', 'nav_msgs/Odometry', (message) => {
            this.messageCount++;
            this.updatePoseFromOdometry(message);
            if (this.callbacks.onOdometryUpdate) {
                this.callbacks.onOdometryUpdate(message);
            }
        });

        // 라이다 스캔 구독
        this.createSubscriber('/scan', 'sensor_msgs/LaserScan', (message) => {
            this.messageCount++;
            if (this.callbacks.onLaserScanUpdate) {
                this.callbacks.onLaserScanUpdate(message);
            }
        });

        // TF 클라이언트 초기화 (tf2_web_republisher 필요)
        this.initializeTfClient();
    }

    /**
     * TF 클라이언트 초기화
     */
    initializeTfClient() {
        try {
            this.tfClient = new ROSLIB.TFClient({
                ros: this.ros,
                angularThres: 0.01,
                transThres: 0.01,
                rate: 10.0,
                fixedFrame: 'map'
            });

            console.log('TF 클라이언트가 초기화되었습니다.');
        } catch (error) {
            console.warn('TF 클라이언트 초기화 실패:', error);
            console.warn('tf2_web_republisher가 실행 중인지 확인하세요.');
        }
    }

    /**
     * 발행자들 초기화
     */
    initializePublishers() {
        // 목표 지점 발행자
        this.createPublisher('/goal_pose', 'geometry_msgs/PoseStamped');
        
        // 속도 명령 발행자 (필요시)
        this.createPublisher('/cmd_vel', 'geometry_msgs/Twist');
    }

    /**
     * 구독자 생성
     */
    createSubscriber(topic, messageType, callback, options = {}) {
        if (this.subscribers.has(topic)) {
            console.warn(`이미 구독 중인 토픽입니다: ${topic}`);
            return;
        }

        const subscriber = new ROSLIB.Topic({
            ros: this.ros,
            name: topic,
            messageType: messageType,
            ...options
        });

        subscriber.subscribe(callback);
        this.subscribers.set(topic, subscriber);
        console.log(`토픽 구독 시작: ${topic}`);
    }

    /**
     * 발행자 생성
     */
    createPublisher(topic, messageType) {
        if (this.publishers.has(topic)) {
            console.warn(`이미 발행 중인 토픽입니다: ${topic}`);
            return;
        }

        const publisher = new ROSLIB.Topic({
            ros: this.ros,
            name: topic,
            messageType: messageType
        });

        this.publishers.set(topic, publisher);
        console.log(`발행자 생성: ${topic}`);
        return publisher;
    }

    /**
     * 목표 지점 발행
     */
    publishGoal(x, y, theta) {
        const goalPublisher = this.publishers.get('/goal_pose');
        if (!goalPublisher) {
            console.error('목표 지점 발행자가 초기화되지 않았습니다.');
            return;
        }

        const goalMessage = new ROSLIB.Message({
            header: {
                stamp: {
                    sec: Math.floor(Date.now() / 1000),
                    nanosec: (Date.now() % 1000) * 1000000
                },
                frame_id: 'map'
            },
            pose: {
                position: {
                    x: x,
                    y: y,
                    z: 0.0
                },
                orientation: {
                    x: 0.0,
                    y: 0.0,
                    z: Math.sin(theta / 2.0),
                    w: Math.cos(theta / 2.0)
                }
            }
        });

        goalPublisher.publish(goalMessage);
        console.log(`목표 지점 발행: x=${x.toFixed(2)}, y=${y.toFixed(2)}, θ=${(theta * 180 / Math.PI).toFixed(1)}°`);
    }

    /**
     * 속도 명령 발행
     */
    publishVelocity(linearX, linearY, angularZ) {
        const velPublisher = this.publishers.get('/cmd_vel');
        if (!velPublisher) {
            console.error('속도 명령 발행자가 초기화되지 않았습니다.');
            return;
        }

        const velMessage = new ROSLIB.Message({
            linear: {
                x: linearX,
                y: linearY,
                z: 0.0
            },
            angular: {
                x: 0.0,
                y: 0.0,
                z: angularZ
            }
        });

        velPublisher.publish(velMessage);
    }

    /**
     * 오도메트리에서 포즈 업데이트
     */
    updatePoseFromOdometry(odomMessage) {
        const pos = odomMessage.pose.pose.position;
        const orient = odomMessage.pose.pose.orientation;
        
        // 쿼터니언을 오일러 각으로 변환
        const theta = Math.atan2(
            2.0 * (orient.w * orient.z + orient.x * orient.y),
            1.0 - 2.0 * (orient.y * orient.y + orient.z * orient.z)
        );

        this.currentPose = {
            x: pos.x,
            y: pos.y,
            theta: theta
        };

        if (this.callbacks.onRobotPoseUpdate) {
            this.callbacks.onRobotPoseUpdate(pos.x, pos.y, theta);
        }
    }

    /**
     * 콜백 함수 등록
     */
    setCallback(eventName, callback) {
        if (this.callbacks.hasOwnProperty(eventName)) {
            this.callbacks[eventName] = callback;
        } else {
            console.warn(`알 수 없는 이벤트: ${eventName}`);
        }
    }

    /**
     * 연결 상태 변경 알림
     */
    notifyConnectionChange(status) {
        if (this.callbacks.onConnectionChange) {
            this.callbacks.onConnectionChange(status);
        }
    }

    /**
     * 오류 알림
     */
    notifyError(error) {
        if (this.callbacks.onError) {
            this.callbacks.onError(error);
        }
    }

    /**
     * 현재 포즈 반환
     */
    getCurrentPose() {
        return { ...this.currentPose };
    }

    /**
     * 업타임 반환
     */
    getUptime() {
        const uptime = Date.now() - this.startTime;
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * 메시지 수신 카운터 반환
     */
    getMessageCount() {
        return this.messageCount;
    }

    /**
     * 연결 해제
     */
    disconnect() {
        if (this.ros) {
            this.ros.close();
        }
        this.isConnected = false;
        console.log('ROS 클라이언트 연결 해제');
    }
}

// 전역 ROS 클라이언트 인스턴스
window.rosClient = new RosClient();