# ROS 2 로봇 관제 시스템 아키텍처

## 시스템 개요

본 시스템은 ROS 2 Humble 기반의 TurtleBot3 로봇을 위한 종합적인 관제 시스템입니다. 웹 기반과 네이티브 데스크톱 두 가지 아키텍처를 제공하여 다양한 환경에서 로봇을 모니터링하고 제어할 수 있습니다.

## 아키텍처 설계 원칙

### 1. 모듈화 (Modularity)
- 각 컴포넌트는 독립적으로 개발, 테스트, 배포 가능
- 명확한 인터페이스를 통한 컴포넌트 간 통신
- 기능별 모듈 분리로 유지보수성 향상

### 2. 확장성 (Scalability)
- 다중 로봇 지원을 위한 확장 가능한 구조
- 플러그인 아키텍처를 통한 기능 확장
- 클라우드 배포를 고려한 설계

### 3. 실시간성 (Real-time)
- 낮은 지연 시간의 데이터 전송
- 효율적인 메시지 직렬화/역직렬화
- 적응적 QoS 프로파일 적용

## 웹 기반 아키텍처

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Browser   │◄──►│  ROSBridge       │◄──►│   ROS 2 Node    │
│                 │    │  WebSocket       │    │                 │
│ - HTML/CSS/JS   │    │  - JSON API      │    │ - Topics        │
│ - roslibjs      │    │  - Message       │    │ - Services      │
│ - ros2djs       │    │    Translation   │    │ - Actions       │
│ - ros3djs       │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │              ┌──────────────────┐               │
        └──────────────►│ tf2_web_        │◄──────────────┘
                       │ republisher      │
                       │                  │
                       │ - TF Transform   │
                       │ - Action Server  │
                       └──────────────────┘
```

### 구성 요소

#### 1. 프론트엔드 (Web Browser)
- **HTML5**: 시멘틱한 구조와 반응형 디자인
- **CSS3**: 모던한 UI/UX, Flexbox/Grid 레이아웃
- **JavaScript ES6+**: 모듈화된 클라이언트 코드
- **RobotWebTools**: ROS 웹 라이브러리 스택

#### 2. 통신 계층 (ROSBridge)
- **WebSocket 연결**: 실시간 양방향 통신
- **JSON 메시지**: 브라우저 친화적 데이터 형식
- **QoS 매핑**: ROS 2 QoS를 웹 환경에 적용

#### 3. 백엔드 (ROS 2 Network)
- **Native ROS 2 Nodes**: 최고 성능의 데이터 처리
- **TF2 System**: 좌표 변환 관리
- **Navigation2**: 경로 계획 및 내비게이션

### 장점
- **접근성**: 플랫폼 독립적, 설치 불필요
- **확장성**: 다중 사용자 지원, 로드 밸런싱 가능
- **배포 용이성**: 웹 서버만 있으면 어디서든 접근

### 단점
- **지연 시간**: WebSocket/JSON 직렬화 오버헤드
- **보안**: 네트워크 노출로 인한 보안 고려사항
- **브라우저 의존성**: 브라우저 호환성 문제

## 네이티브 데스크톱 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                 PyQt5 Application                       │
├─────────────────────────────────────────────────────────┤
│  Main Thread (GUI)           │  Worker Thread (ROS)     │
│                              │                          │
│ ┌─────────────────────────┐  │ ┌─────────────────────┐  │
│ │     Main Window         │  │ │   ROS Node Worker   │  │
│ │                         │  │ │                     │  │
│ │ - Map Widget           │  │ │ - rclpy.spin()      │  │
│ │ - Status Widget        │  │ │ - Topic Subscribers │  │
│ │ - Control Widget       │  │ │ - Publishers        │  │
│ └─────────────────────────┘  │ │ - TF Listener       │  │
│             │                │ └─────────────────────┘  │
│             │                │            │             │
│         Qt Signals          │      Qt Signals          │
│             │                │            │             │
│             ▼                │            ▼             │
│ ┌─────────────────────────┐  │ ┌─────────────────────┐  │
│ │      UI Updates         │  │ │   ROS Callbacks     │  │
│ │                         │  │ │                     │  │
│ │ - Map Rendering        │  │ │ - /map              │  │
│ │ - Robot Visualization  │  │ │ - /tf               │  │
│ │ - Status Display       │  │ │ - /odom             │  │
│ └─────────────────────────┘  │ │ - /scan             │  │
└─────────────────────┬────────┴─┴─────────────────────┘  │
                      │                                   │
                      ▼                                   │
            ┌─────────────────────────────────────────────┘
            │         ROS 2 Network
            │
            ├── Topics: /map, /tf, /odom, /scan, /goal_pose
            ├── Services: Navigation services
            └── Actions: Navigation actions
```

### 구성 요소

#### 1. GUI 계층 (PyQt5)
- **Main Window**: 전체 애플리케이션 윈도우 관리
- **Widget System**: 재사용 가능한 UI 컴포넌트
- **Signal/Slot**: 스레드 안전한 이벤트 처리

#### 2. 멀티스레딩 계층
- **GUI Thread**: UI 업데이트 전용 스레드
- **ROS Worker Thread**: ROS 노드 실행 스레드
- **Thread Communication**: Qt Signal/Slot 메커니즘

#### 3. ROS 통신 계층
- **Direct ROS 2 API**: 최고 성능의 native 통신
- **QoS Management**: 세밀한 QoS 제어
- **TF2 Integration**: 실시간 좌표 변환

### 장점
- **성능**: 직접적인 ROS 2 통신, 최소 지연시간
- **기능**: 모든 ROS 2 기능에 접근 가능
- **보안**: 로컬 실행으로 네트워크 노출 최소화

### 단점
- **설치 복잡성**: 의존성 설치 및 환경 설정 필요
- **플랫폼 의존성**: OS별 패키징 및 배포 필요
- **확장성**: 단일 사용자, 원격 접근 제한

## 데이터 흐름

### 핵심 토픽 및 메시지 타입

```
/map (nav_msgs/OccupancyGrid)
├── 용도: 2D 점유 격자 지도
├── QoS: Reliable, Transient Local
└── 처리: 이미지 변환 후 시각화

/tf, /tf_static (tf2_msgs/TFMessage)
├── 용도: 좌표 변환 정보
├── QoS: Reliable, Volatile
└── 처리: map→base_link 변환 추출

/odom (nav_msgs/Odometry)
├── 용도: 오도메트리 정보
├── QoS: Reliable, Volatile
└── 처리: 속도 및 포즈 정보 표시

/scan (sensor_msgs/LaserScan)
├── 용도: 라이다 스캔 데이터
├── QoS: Best Effort
└── 처리: 실시간 장애물 시각화

/goal_pose (geometry_msgs/PoseStamped)
├── 용도: 목표 지점 명령
├── QoS: Reliable
└── 처리: 내비게이션 시스템으로 전송
```

### QoS 프로파일 전략

| 토픽 | Reliability | Durability | 설명 |
|------|------------|------------|------|
| `/map` | Reliable | Transient Local | 지도는 손실되면 안되며, 늦게 연결된 클라이언트도 받아야 함 |
| `/tf` | Reliable | Volatile | 변환 정보는 정확해야 하지만 과거 데이터는 불필요 |
| `/scan` | Best Effort | Volatile | 센서 데이터는 실시간성이 중요, 일부 손실 허용 |
| `/goal_pose` | Reliable | Volatile | 명령은 확실히 전달되어야 함 |

## 성능 최적화

### 웹 기반 시스템
1. **메시지 압축**: ROSBridge compression 활성화
2. **선택적 구독**: 필요한 토픽만 구독
3. **클라이언트 캐싱**: 정적 데이터 캐싱
4. **렌더링 최적화**: Canvas/WebGL 활용

### 네이티브 시스템
1. **스레드 풀**: MultiThreadedExecutor 활용
2. **메모리 관리**: 효율적인 픽셀 데이터 처리
3. **렌더링 최적화**: 변경된 영역만 업데이트
4. **QoS 튜닝**: 애플리케이션별 최적화

## 확장성 고려사항

### 다중 로봇 지원
- 네임스페이스 기반 토픽 관리
- 로봇별 색상/아이콘 구분
- 중앙집중식 상태 관리

### 클라우드 배포
- Docker 컨테이너화
- Kubernetes 오케스트레이션
- 로드 밸런서 구성

### 플러그인 아키텍처
- 센서별 시각화 플러그인
- 로봇 타입별 어댑터
- 커스텀 제어 인터페이스

## 보안 고려사항

### 웹 기반 시스템
- HTTPS/WSS 암호화 통신
- 인증/권한 관리 시스템
- CORS 정책 적용
- 입력값 검증 및 sanitization

### 네이티브 시스템
- 로컬 권한 관리
- 설정 파일 암호화
- 감사 로그 생성

이 아키텍처는 현재 요구사항을 충족하면서도 미래 확장을 고려한 확장 가능하고 유지보수가 용이한 시스템을 제공합니다.