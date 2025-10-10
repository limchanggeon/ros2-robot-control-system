# UTM 가상환경에서 ROS 2 로봇 관제 시스템 설정 가이드

이 문서는 UTM 가상환경에서 ROS 2 로봇 관제 시스템을 설정하고 실행하는 방법을 안내합니다.

## 🖥️ UTM 가상머신 생성

### 1. UTM 설치 및 Ubuntu 22.04 VM 생성
- [UTM 다운로드](https://mac.getutm.app/)
- Ubuntu 22.04 LTS ISO 다운로드
- VM 설정:
  - **CPU**: 4 cores 이상
  - **RAM**: 8GB 이상
  - **Storage**: 40GB 이상
  - **GPU**: 가상화 가속 활성화

### 2. Ubuntu 22.04 설치
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 도구 설치
sudo apt install -y curl wget git build-essential
```

## 🤖 ROS 2 Humble 설치

### 1. ROS 2 저장소 추가
```bash
# 유니버스 저장소 활성화
sudo apt install software-properties-common
sudo add-apt-repository universe

# ROS 2 GPG 키 추가
sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg

# ROS 2 저장소 추가
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

### 2. ROS 2 Humble 패키지 설치
```bash
# 패키지 목록 업데이트
sudo apt update

# ROS 2 Desktop 설치 (모든 GUI 도구 포함)
sudo apt install ros-humble-desktop -y

# 개발 도구 설치
sudo apt install ros-dev-tools -y

# TurtleBot3 패키지 설치
sudo apt install ros-humble-turtlebot3* -y

# Navigation2 패키지 설치
sudo apt install ros-humble-navigation2 ros-humble-nav2-bringup -y

# 웹 인터페이스용 패키지 설치
sudo apt install ros-humble-rosbridge-server -y
```

### 3. tf2_web_republisher 설치 (소스에서 빌드)
```bash
# 작업공간 생성
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src

# tf2_web_republisher 클론 (ROS 2 호환 버전)
git clone https://github.com/RobotWebTools/tf2_web_republisher.git -b ros2

# 작업공간 빌드
cd ~/ros2_ws
colcon build --packages-select tf2_web_republisher

# 환경 설정
echo "source ~/ros2_ws/install/setup.bash" >> ~/.bashrc
```

## 📥 프로젝트 설정

### 1. 저장소 클론
```bash
# 홈 디렉토리로 이동
cd ~

# 프로젝트 클론 (실제 저장소 URL로 변경)
git clone https://github.com/your-username/ros2-robot-control-system.git
cd ros2-robot-control-system
```

### 2. 환경 설정
```bash
# ROS 2 환경 설정을 .bashrc에 추가
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
echo "export TURTLEBOT3_MODEL=burger" >> ~/.bashrc
echo "export ROS_DOMAIN_ID=0" >> ~/.bashrc
source ~/.bashrc

# 프로젝트 의존성 설치
./setup.sh
```

### 3. Python 의존성 설치
```bash
# pip 업그레이드
python3 -m pip install --upgrade pip

# 프로젝트 의존성 설치
pip3 install -r requirements.txt

# 추가 GUI 의존성 (데스크톱 앱용)
sudo apt install python3-pyqt5 python3-pyqt5.qtsvg -y
```

## 🚀 시뮬레이션 환경 설정

### 1. Gazebo 시뮬레이션 설치
```bash
# Gazebo 설치
sudo apt install gazebo -y

# TurtleBot3 시뮬레이션 패키지 설치
sudo apt install ros-humble-turtlebot3-simulations -y
```

### 2. 시뮬레이션 실행
```bash
# 터미널 1: Gazebo 월드 실행
export TURTLEBOT3_MODEL=burger
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py

# 터미널 2: SLAM 실행 (지도 생성)
ros2 launch turtlebot3_cartographer cartographer.launch.py use_sim_time:=True

# 터미널 3: RViz 실행 (시각화)
ros2 launch turtlebot3_cartographer cartographer_rviz.launch.py use_sim_time:=True

# 터미널 4: 텔레옵 (키보드 조작)
ros2 run turtlebot3_teleop teleop_keyboard
```

### 3. 지도 저장 (SLAM 완료 후)
```bash
# 지도 저장
ros2 run nav2_map_server map_saver_cli -f ~/turtlebot3_map
```

## 🌐 관제 시스템 실행

### 1. 내비게이션 시스템 시작
```bash
# 터미널 1: 시뮬레이션 (이미 실행 중이면 생략)
export TURTLEBOT3_MODEL=burger
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py

# 터미널 2: 내비게이션 (저장된 지도 사용)
ros2 launch turtlebot3_navigation2 navigation2.launch.py use_sim_time:=True map:=$HOME/turtlebot3_map.yaml
```

### 2. 웹 기반 관제 시스템 (권장)
```bash
# 터미널 3: 웹 관제 시스템 시작
cd ~/ros2-robot-control-system
./scripts/start_web_server.sh
```

Firefox 또는 Chrome에서 `http://localhost:8080` 접속

### 3. 네이티브 데스크톱 앱
```bash
# 터미널 3: 데스크톱 앱 실행
cd ~/ros2-robot-control-system
./scripts/start_desktop_app.sh
```

## 🔧 네트워크 설정

### UTM VM의 네트워크 설정
1. UTM에서 VM 설정 → Network
2. Network Mode: "Shared Network" 선택
3. Port Forwarding 설정:
   - Host Port: 8080 → Guest Port: 8080 (웹 서버)
   - Host Port: 9090 → Guest Port: 9090 (ROSBridge)

## 🐛 문제 해결

### 1. ROSBridge 연결 실패
```bash
# ROSBridge 상태 확인
ros2 node list | grep rosbridge

# 수동으로 ROSBridge 시작
ros2 launch rosbridge_server rosbridge_websocket_launch.xml

# 포트 확인
sudo netstat -tlnp | grep 9090
```

### 2. tf2_web_republisher 문제
```bash
# tf2_web_republisher 상태 확인
ros2 node list | grep tf2_web_republisher

# 수동 실행
ros2 run tf2_web_republisher tf2_web_republisher
```

### 3. 시뮬레이션 성능 개선
```bash
# Gazebo 클라이언트 없이 서버만 실행 (헤드리스 모드)
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py headless:=True

# RViz에서 불필요한 디스플레이 비활성화
# - PointCloud2 디스플레이 끄기
# - Camera 디스플레이 끄기
```

### 4. 메모리 부족 문제
```bash
# 스왑 파일 생성 (4GB)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 영구 설정
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 📋 성능 최적화 팁

### 1. VM 리소스 최적화
- CPU: 호스트 CPU의 50-75%할당
- RAM: 최소 8GB, 권장 12GB
- GPU: Metal 가속 활성화 (Apple Silicon)

### 2. Ubuntu 최적화
```bash
# 불필요한 서비스 비활성화
sudo systemctl disable snapd
sudo systemctl disable bluetooth

# GUI 효과 최소화
gsettings set org.gnome.desktop.interface enable-animations false
```

### 3. ROS 2 최적화
```bash
# DDS 설정 (Fast-DDS 사용)
export RMW_IMPLEMENTATION=rmw_fastrtps_cpp
echo "export RMW_IMPLEMENTATION=rmw_fastrtps_cpp" >> ~/.bashrc
```

## 🎯 다음 단계

1. **실제 로봇 연결**: TurtleBot3 실제 하드웨어 연결
2. **맵 편집**: 저장된 지도 편집 및 최적화
3. **커스터마이징**: 관제 시스템 UI 커스터마이징
4. **다중 로봇**: 여러 로봇 동시 제어 시스템 구축

이제 UTM 가상환경에서 완전한 ROS 2 로봇 관제 시스템을 실행할 수 있습니다! 🎉