# 실제 TurtleBot3 로봇 관제 시스템 빠른 시작 가이드

## 🚀 현재 환경 정보
- **로봇 IP**: 192.168.10.3 (고정 IP)
- **통신 방식**: 유선 LAN (LAN to LAN)
- **지도 파일**: `/home/mokwon12/ros2_ws/src/my_robot_config/maps/D3floor.yaml`
- **로봇 모델**: TurtleBot3 Burger

## ⚡ 3단계 빠른 시작

### 1단계: 로봇 브링업 (로봇에서 실행)
```bash
# SSH로 로봇에 접속 (또는 로봇에서 직접 실행)
ssh ubuntu@192.168.10.3

# 로봇 브링업 실행
ros2 launch turtlebot3_bringup robot.launch.py
```

### 2단계: 자율주행 시스템 시작 (PC에서 실행)
```bash
# 터미널 1: 내비게이션 시스템
ros2 launch turtlebot3_navigation2 navigation2.launch.py \
  use_sim_time:=False \
  map:=/home/mokwon12/ros2_ws/src/my_robot_config/maps/D3floor.yaml \
  autostart:=True

# 터미널 2: RViz2 시각화
ros2 run rviz2 rviz2 -d $(ros2 pkg prefix nav2_bringup)/share/nav2_bringup/rviz/nav2_default_view.rviz
```

### 3단계: 웹 관제 시스템 시작
```bash
# 관제 시스템 디렉토리로 이동
cd ~/ros2-robot-control-system

# 실제 로봇용 관제 시스템 시작
./scripts/start_real_robot_system.sh
```

브라우저에서 `http://localhost:8080` 접속하여 웹 관제 인터페이스 사용

## 🔧 환경 변수 설정 확인

### PC에서 설정해야 할 환경 변수
```bash
export ROS_DOMAIN_ID=0
export ROS_LOCALHOST_ONLY=0
export TURTLEBOT3_MODEL=burger
export ROBOT_IP=192.168.10.3

# .bashrc에 영구 저장
echo "export ROS_DOMAIN_ID=0" >> ~/.bashrc
echo "export ROS_LOCALHOST_ONLY=0" >> ~/.bashrc
echo "export TURTLEBOT3_MODEL=burger" >> ~/.bashrc
echo "export ROBOT_IP=192.168.10.3" >> ~/.bashrc
```

## 🔍 연결 상태 확인

### 네트워크 연결 테스트
```bash
# 로봇 핑 테스트
ping 192.168.10.3

# 네트워크 인터페이스 확인 (PC가 192.168.10.x 대역에 있어야 함)
ip addr show | grep "192.168.10"
```

### ROS 2 연결 테스트
```bash
# 로봇 토픽 확인
ros2 topic list

# 로봇 센서 데이터 확인
ros2 topic echo /scan --once
ros2 topic echo /odom --once
ros2 topic echo /battery_state --once

# 통신 주파수 확인
ros2 topic hz /scan
ros2 topic hz /odom
```

## 🎮 웹 관제 시스템 사용법

### 기본 조작
1. **지도 확인**: 로봇 위치와 D3floor 지도 표시
2. **목표 설정**: 좌표 입력 또는 미리 정의된 위치 선택
3. **빠른 제어**: 전진/후진/회전 버튼 사용
4. **상태 모니터링**: 배터리, 속도, 센서 데이터 실시간 확인

### 미리 정의된 위치
- **홈**: (0, 0) - 시작점
- **연구실 입구**: (5, 0)
- **회의실**: (3, 4)
- **엘리베이터**: (-2, 6)
- **창고**: (-4, -3)

## 🚨 문제 해결

### 로봇이 보이지 않는 경우
```bash
# 1. 네트워크 연결 확인
ping 192.168.10.3

# 2. ROS 2 데몬 재시작
ros2 daemon stop
ros2 daemon start

# 3. 환경 변수 재설정
source ~/.bashrc
```

### 내비게이션이 작동하지 않는 경우
```bash
# 1. 지도 파일 확인
ls -la /home/mokwon12/ros2_ws/src/my_robot_config/maps/D3floor.yaml

# 2. 로봇 위치 초기화 (RViz2에서)
# - 2D Pose Estimate 버튼 클릭
# - 지도에서 로봇의 실제 위치 클릭 및 드래그

# 3. 내비게이션 상태 확인
ros2 topic echo /amcl_pose
ros2 node info /amcl
```

### 웹 인터페이스 연결 실패
```bash
# ROSBridge 상태 확인
ros2 node list | grep rosbridge

# 포트 사용 확인
netstat -an | grep 9090

# 수동으로 ROSBridge 재시작
pkill -f rosbridge
ros2 launch rosbridge_server rosbridge_websocket_launch.xml
```

## 📞 추가 도움말

- **ROS 2 공식 문서**: https://docs.ros.org/en/humble/
- **TurtleBot3 매뉴얼**: https://emanual.robotis.com/docs/en/platform/turtlebot3/
- **Navigation2 가이드**: https://navigation.ros.org/

---
**실제 로봇과 함께 즐거운 자율주행을! 🤖✨**