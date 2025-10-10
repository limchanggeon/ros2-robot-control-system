# ROS 2 TurtleBot3 Robot Control System 🤖

[![ROS 2 Humble](https://img.shields.io/badge/ROS%202-Humble-blue)](https://docs.ros.org/en/humble/)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8+-green)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TurtleBot3 기반 ROS 2 Humble 로봇 관제 시스템입니다. 실제 로봇과 유선 LAN 통신하여 웹 기반 및 네이티브 데스크톱 인터페이스를 제공합니다.

![System Architecture](https://img.shields.io/badge/Architecture-Web%20%2B%20Desktop-brightgreen)

## ✨ 주요 기능

- 🗺️ **실시간 지도 시각화**: OccupancyGrid 기반 D3floor 지도 표시
- 🤖 **로봇 위치 추적**: TF 변환 기반 정확한 실시간 위치 표시  
- 🎯 **목표 지점 설정**: 웹 인터페이스로 간편한 로봇 제어
- 📡 **센서 데이터 모니터링**: 라이다 스캔, 오도메트리 실시간 표시
- 🕹️ **빠른 제어**: 전진/후진/회전 등 원터치 명령
- 📍 **미리 정의된 위치**: D3floor 주요 위치 원클릭 이동
- 🌐 **다중 플랫폼**: 웹 브라우저 + PyQt5 데스크톱 앱

## 🤖 실제 로봇 환경 정보

- **로봇 모델**: TurtleBot3 Burger
- **로봇 IP**: 192.168.10.3 (고정 IP)
- **통신 방식**: 유선 LAN (LAN to LAN)
- **지도**: D3floor (3층 평면도)
- **자율주행**: Navigation2 기반

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/LimChangGeon/ros2-robot-control-system.git
cd ros2-robot-control-system
```

### 2. 환경 설정
```bash
# ROS 2 환경 설정
source /opt/ros/humble/setup.bash

# 자동 설치 스크립트 실행
./setup.sh
```

### 3. 로봇 브링업 (로봇에서 실행)
```bash
# SSH로 로봇 접속 또는 로봇에서 직접 실행
ssh ubuntu@192.168.10.3
ros2 launch turtlebot3_bringup robot.launch.py
```

### 4. 자율주행 시스템 시작 (PC에서 실행)
```bash
# 내비게이션 시스템
ros2 launch turtlebot3_navigation2 navigation2.launch.py \
  use_sim_time:=False \
  map:=/home/mokwon12/ros2_ws/src/my_robot_config/maps/D3floor.yaml \
  autostart:=True

# RViz2 시각화 (별도 터미널)
ros2 run rviz2 rviz2 -d $(ros2 pkg prefix nav2_bringup)/share/nav2_bringup/rviz/nav2_default_view.rviz
```

### 5. 웹 관제 시스템 시작
```bash
# 실제 로봇용 관제 시스템 시작
./scripts/start_real_robot_system.sh
```

**브라우저에서 `http://localhost:8080` 접속! 🎉**

## 📁 프로젝트 구조

```
ros2-robot-control-system/
├── 📄 README.md                    # 프로젝트 개요
├── 📄 requirements.txt             # Python 의존성
├── 🚀 setup.sh                    # 자동 환경 설정
├── 📂 src/                        # 소스 코드
│   ├── 🖥️ desktop/               # PyQt5 네이티브 앱
│   │   ├── main.py               # 메인 실행 파일
│   │   ├── ros_worker.py         # ROS 워커 스레드
│   │   └── gui/                  # GUI 컴포넌트들
│   └── 🌐 web/                   # 웹 기반 앱
│       ├── index.html            # 메인 웹페이지
│       ├── css/style.css         # 현대적 스타일
│       └── js/                   # JavaScript 모듈들
├── 📂 scripts/                   # 실행 스크립트
│   ├── start_real_robot_system.sh # 실제 로봇용 시작
│   ├── start_web_server.sh       # 웹 시스템 시작
│   └── start_desktop_app.sh      # 데스크톱 앱 시작
├── 📂 config/                    # 설정 파일들
│   ├── qos_profiles.yaml         # ROS 2 QoS 설정
│   └── system_config.yaml        # 시스템 설정
├── 📂 launch/                    # ROS 2 런치 파일
└── 📂 docs/                      # 상세 문서
    ├── REAL_ROBOT_QUICKSTART.md  # 실제 로봇 빠른 시작
    ├── UTM_SETUP.md              # UTM 가상환경 설정
    ├── ARCHITECTURE.md           # 시스템 아키텍처
    └── GITHUB_SETUP.md           # GitHub 저장소 관리
```

## 🎮 웹 관제 시스템 사용법

### 기본 조작
1. **지도 확인**: 로봇 위치와 D3floor 지도 실시간 표시
2. **목표 설정**: 좌표 입력 또는 미리 정의된 위치 선택
3. **빠른 제어**: 전진/후진/회전 버튼으로 즉시 제어
4. **상태 모니터링**: 배터리, 속도, 센서 데이터 실시간 확인

### 📍 미리 정의된 위치 (D3floor)
- 🏠 **홈**: (0, 0) - 시작점
- 🚪 **연구실 입구**: (5, 0)
- 🪑 **회의실**: (3, 4)  
- 🛗 **엘리베이터**: (-2, 6)
- 📦 **창고**: (-4, -3)

## 🛠️ 시스템 요구사항

### 운영체제
- Ubuntu 22.04 LTS (권장)
- Ubuntu 20.04 LTS
- macOS (개발 환경)

### ROS 2 패키지
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

## 🔧 네트워크 설정

### 환경 변수 설정
```bash
export ROS_DOMAIN_ID=0
export ROS_LOCALHOST_ONLY=0
export TURTLEBOT3_MODEL=burger
export ROBOT_IP=192.168.10.3
```

### 연결 테스트
```bash
# 네트워크 연결 확인
ping 192.168.10.3

# ROS 2 토픽 확인
ros2 topic list
ros2 topic echo /scan --once
```

## 🐛 문제 해결

### 로봇이 보이지 않는 경우
```bash
# ROS 2 데몬 재시작
ros2 daemon stop && ros2 daemon start

# 환경 변수 재확인
echo $ROS_DOMAIN_ID $ROS_LOCALHOST_ONLY
```

### 웹 인터페이스 연결 실패
```bash
# ROSBridge 상태 확인
ros2 node list | grep rosbridge

# 포트 사용 확인
netstat -an | grep 9090
```

자세한 문제 해결은 [실제 로봇 빠른 시작 가이드](docs/REAL_ROBOT_QUICKSTART.md)를 참조하세요.

## 📖 상세 문서

- 📋 [실제 로봇 빠른 시작](docs/REAL_ROBOT_QUICKSTART.md) - 3단계 빠른 시작 가이드
- 🖥️ [UTM 가상환경 설정](docs/UTM_SETUP.md) - VM 환경 설정 방법
- 🏗️ [시스템 아키텍처](docs/ARCHITECTURE.md) - 웹/데스크톱 아키텍처 상세 분석
- 📦 [GitHub 저장소 관리](docs/GITHUB_SETUP.md) - 개발 워크플로우

## 🤝 기여하기

1. 이 저장소를 Fork합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [ROS 2 Humble](https://docs.ros.org/en/humble/) 커뮤니티
- [TurtleBot3](https://emanual.robotis.com/docs/en/platform/turtlebot3/) 개발팀  
- [Robot Web Tools](http://robotwebtools.org/) 프로젝트
- [Navigation2](https://navigation.ros.org/) 개발팀

## 📞 지원

문제가 발생하면 [Issues](https://github.com/LimChangGeon/ros2-robot-control-system/issues) 페이지에서 문의해주세요.

---

**Made with ❤️ for TurtleBot3 & ROS 2 Community**

**Happy Robot Controlling! 🤖✨**