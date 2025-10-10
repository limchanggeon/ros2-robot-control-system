# ROS 2 Robot Control System 🤖

TurtleBot3 기반 ROS 2 Humble 로봇 관제 시스템입니다. 웹 기반과 네이티브 데스크톱 두 가지 인터페이스를 제공합니다.

## ✨ 주요 기능

- 🗺️ **실시간 지도 시각화**: OccupancyGrid 기반 2D 지도 표시
- 🤖 **로봇 위치 추적**: TF 변환 기반 정확한 실시간 위치 표시
- 🎯 **목표 지점 설정**: 클릭 또는 좌표 입력으로 로봇 제어
- 📡 **센서 데이터 모니터링**: 라이다 스캔, 오도메트리 데이터 실시간 표시
- 🕹️ **빠른 제어**: 전진/후진/회전 등 간편한 원터치 명령
- 📍 **미리 정의된 위치**: 자주 사용하는 위치 원클릭 이동
- 🌐 **다중 플랫폼**: 웹 브라우저 또는 네이티브 데스크톱 앱

## 🏗️ 시스템 아키텍처

### 웹 기반 (권장)
```
브라우저 ↔ ROSBridge ↔ ROS 2 Network
```
- **장점**: 플랫폼 독립적, 원격 접근 가능, 설치 간단
- **기술**: HTML5, JavaScript, roslibjs, ros2djs

### 네이티브 데스크톱
```
PyQt5 GUI ↔ rclpy ↔ ROS 2 Network
```
- **장점**: 최고 성능, 낮은 지연시간, 모든 ROS 2 기능 접근
- **기술**: Python, PyQt5, rclpy

## � 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/ros2-robot-control-system.git
cd ros2-robot-control-system
```

### 2. 환경 설정
```bash
# ROS 2 환경 설정 (Ubuntu 22.04)
source /opt/ros/humble/setup.bash

# 시스템 의존성 설치
./setup.sh
```

### 3. 시뮬레이션 환경 시작 (별도 터미널)
```bash
# Gazebo 시뮬레이션 실행
export TURTLEBOT3_MODEL=burger
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py

# 내비게이션 시스템 실행 (별도 터미널)
ros2 launch turtlebot3_navigation2 navigation2.launch.py use_sim_time:=True map:=/path/to/map.yaml
```

### 4. 관제 시스템 실행

#### 웹 기반 시스템 (권장)
```bash
./scripts/start_web_server.sh
```
브라우저에서 `http://localhost:8080` 접속

#### 네이티브 데스크톱 앱
```bash
./scripts/start_desktop_app.sh
```

## 📋 시스템 요구사항

### 운영체제
- Ubuntu 22.04 LTS (권장)
- Ubuntu 20.04 LTS
- macOS (개발 환경, 일부 기능 제한)

### ROS 2
- ROS 2 Humble Hawksbill
- 필수 패키지:
  - `ros-humble-desktop`
  - `ros-humble-turtlebot3*`
  - `ros-humble-navigation2`
  - `ros-humble-rosbridge-server`
  - `ros-humble-tf2-web-republisher`

### Python 의존성
```
rclpy==3.3.7
PyQt5==5.15.7
numpy==1.24.3
```

## 🛠️ UTM 가상환경 설정 가이드

### 1. Ubuntu 22.04 VM 생성
```bash
# VM 최소 사양
- CPU: 4 cores
- RAM: 8GB
- Storage: 40GB
- GPU: 가상화 가속 활성화
```

### 2. ROS 2 Humble 설치
```bash
# Ubuntu 업데이트
sudo apt update && sudo apt upgrade -y

# ROS 2 Humble 설치
sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

sudo apt update
sudo apt install ros-humble-desktop -y
```

### 3. 프로젝트 설정
```bash
# 저장소 클론
git clone <repository-url>
cd ros2-robot-control-system

# 환경 설정
./setup.sh

# .bashrc에 환경변수 추가
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
echo "export TURTLEBOT3_MODEL=burger" >> ~/.bashrc
source ~/.bashrc
```

## 📁 프로젝트 구조

```
ros2-robot-control-system/
├── README.md                   # 프로젝트 개요
├── requirements.txt            # Python 의존성
├── setup.sh                   # 환경 설정 스크립트
├── .gitignore                 # Git 제외 파일
├── src/                       # 소스 코드
│   ├── desktop/              # 네이티브 데스크톱 앱
│   │   ├── main.py           # 메인 실행 파일
│   │   ├── ros_worker.py     # ROS 노드 워커
│   │   └── gui/              # GUI 컴포넌트
│   └── web/                  # 웹 기반 앱
│       ├── index.html        # 메인 웹페이지
│       ├── css/style.css     # 스타일시트
│       └── js/               # JavaScript 모듈
├── scripts/                  # 실행 스크립트
│   ├── start_web_server.sh   # 웹 서버 시작
│   └── start_desktop_app.sh  # 데스크톱 앱 시작
├── config/                   # 설정 파일
├── launch/                   # ROS 2 런치 파일
└── docs/                     # 문서
```

## 🚀 빠른 시작

### 1. 환경 설정
```bash
cd /Users/limchang-geon/Desktop/ros_system
chmod +x setup.sh
./setup.sh
```

### 2. 웹 기반 시스템 실행
```bash
# ROS Bridge 서버 시작
ros2 launch ros_system web_bridge.launch.py

# 웹 서버 시작 (별도 터미널)
./scripts/start_web_server.sh
```

### 3. 네이티브 데스크톱 앱 실행
```bash
./scripts/start_desktop_app.sh
```

## 📊 아키텍처 비교

| 기능 | 웹 기반 | 네이티브 데스크톱 |
|------|---------|------------------|
| 접근성 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 성능 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 개발 복잡도 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 배포 용이성 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 확장성 | ⭐⭐⭐⭐⭐ | ⭐⭐ |

## 🔧 주요 기능

- **실시간 로봇 위치 추적**: TF 변환 기반 정확한 위치 시각화
- **지도 시각화**: OccupancyGrid 기반 2D 지도 렌더링
- **센서 데이터 표시**: LaserScan 데이터 실시간 시각화
- **로봇 제어**: 목표 지점 설정 및 내비게이션 명령
- **멀티플랫폼 지원**: macOS, Linux, Windows 호환

## 📋 요구사항

### ROS 2 패키지
- `ros-humble-desktop`
- `ros-humble-turtlebot3*`
- `ros-humble-rosbridge-server`
- `ros-humble-tf2-web-republisher`

### Python 패키지
- `rclpy`
- `PyQt5`
- `numpy`
- `tf2-ros`

## 🛠️ 개발 가이드

자세한 개발 및 배포 가이드는 `docs/` 디렉토리를 참조하세요.

## 📝 라이선스

MIT License