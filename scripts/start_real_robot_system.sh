#!/bin/bash

# 실제 로봇 연결 및 관제 시스템 시작 스크립트

echo "🤖 실제 TurtleBot3 로봇 관제 시스템을 시작합니다..."

# ROS 2 환경 설정
source /opt/ros/humble/setup.bash

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
WEB_DIR="$PROJECT_DIR/src/web"

echo "📁 프로젝트 디렉토리: $PROJECT_DIR"

# 실제 로봇용 환경 변수 설정 (고정 IP: 192.168.10.3)
export ROS_DOMAIN_ID=0
export ROS_LOCALHOST_ONLY=0
export TURTLEBOT3_MODEL=burger
export ROBOT_IP=192.168.10.3

echo "🔧 ROS 2 환경 변수 설정:"
echo "  ROS_DOMAIN_ID: $ROS_DOMAIN_ID"
echo "  ROS_LOCALHOST_ONLY: $ROS_LOCALHOST_ONLY"
echo "  TURTLEBOT3_MODEL: $TURTLEBOT3_MODEL"
echo "  ROBOT_IP: $ROBOT_IP"

# 로봇 네트워크 연결 테스트
echo "🔍 로봇 네트워크 연결 확인 중..."
if ping -c 3 $ROBOT_IP >/dev/null 2>&1; then
    echo "✅ 로봇 ($ROBOT_IP) 네트워크 연결 성공!"
else
    echo "❌ 로봇 ($ROBOT_IP) 네트워크 연결 실패!"
    echo "   네트워크 설정을 확인하세요."
fi

# ROS 2 로봇 연결 테스트
echo "🔍 ROS 2 로봇 연결 상태 확인 중..."
if timeout 10s ros2 topic list | grep -q "/scan"; then
    echo "✅ 로봇 ROS 2 노드가 연결되었습니다!"
    echo "📡 발견된 로봇 토픽들:"
    ros2 topic list | grep -E "(scan|odom|cmd_vel|battery)" | head -5
    echo "🤖 활성 노드 수: $(ros2 node list | wc -l)"
else
    echo "⚠️  로봇 ROS 2 노드가 연결되지 않았습니다."
    echo "   다음을 확인하세요:"
    echo "   1. 로봇에서 'ros2 launch turtlebot3_bringup robot.launch.py' 실행 여부"
    echo "   2. ROS_DOMAIN_ID 설정 (현재: $ROS_DOMAIN_ID)"
    echo "   3. 방화벽 설정"
    echo ""
    echo "계속 진행하시겠습니까? (y/N)"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 시작을 취소합니다."
        exit 1
    fi
fi

# 포트 설정
WEB_PORT=8080
ROSBRIDGE_PORT=9090

# 이미 실행 중인 서버 확인
if lsof -Pi :$WEB_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  포트 $WEB_PORT가 이미 사용 중입니다."
    pkill -f "python3.*http.server.*$WEB_PORT" || true
    sleep 2
fi

if lsof -Pi :$ROSBRIDGE_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  포트 $ROSBRIDGE_PORT가 이미 사용 중입니다."
    pkill -f "rosbridge" || true
    sleep 2
fi

# ROSBridge 서버 시작
echo "🔗 ROSBridge 서버를 시작합니다..."
ros2 launch rosbridge_server rosbridge_websocket_launch.xml port:=$ROSBRIDGE_PORT address:=0.0.0.0 &
ROSBRIDGE_PID=$!
echo "ROSBridge PID: $ROSBRIDGE_PID"
sleep 3

# tf2_web_republisher 시작
echo "🔄 TF2 Web Republisher를 시작합니다..."
ros2 run tf2_web_republisher tf2_web_republisher &
TF_REPUBLISHER_PID=$!
echo "TF2 Web Republisher PID: $TF_REPUBLISHER_PID"
sleep 2

# ROSBridge 연결 테스트
echo "🧪 ROSBridge 연결 테스트 중..."
if curl -s "http://localhost:$ROSBRIDGE_PORT" >/dev/null 2>&1; then
    echo "✅ ROSBridge 서버가 정상적으로 시작되었습니다."
else
    echo "⚠️  ROSBridge 서버 연결을 확인할 수 없습니다."
fi

# 웹 서버 시작
echo "🌐 웹 관제 시스템을 시작합니다 (포트: $WEB_PORT)..."
cd "$WEB_DIR"
python3 -m http.server $WEB_PORT &
WEB_SERVER_PID=$!
echo "웹 서버 PID: $WEB_SERVER_PID"

# 잠시 대기
sleep 2

# 브라우저에서 열기
echo "🚀 시스템 시작 완료!"
echo ""
echo "🌐 웹 관제 인터페이스: http://localhost:$WEB_PORT"
echo "🔗 ROSBridge WebSocket: ws://localhost:$ROSBRIDGE_PORT"
echo ""
echo "📊 실시간 로봇 상태:"
echo "  - 로봇 토픽 수: $(ros2 topic list | wc -l)"
echo "  - 활성 노드 수: $(ros2 node list | wc -l)"
echo ""

if command -v open >/dev/null 2>&1; then
    # macOS
    open "http://localhost:$WEB_PORT"
elif command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open "http://localhost:$WEB_PORT"
else
    echo "수동으로 브라우저를 열어 http://localhost:$WEB_PORT 에 접속하세요."
fi

echo ""
echo "💡 유용한 명령어들:"
echo "  로봇 토픽 확인:     ros2 topic list"
echo "  로봇 상태 확인:     ros2 topic echo /battery_state"
echo "  네트워크 지연 확인:  ros2 topic hz /scan"
echo ""
echo "시스템을 종료하려면 Ctrl+C를 누르세요."

# PID 파일 생성
echo $WEB_SERVER_PID > /tmp/robot_control_real.pid
echo $TF_REPUBLISHER_PID >> /tmp/robot_control_real.pid
echo $ROSBRIDGE_PID >> /tmp/robot_control_real.pid

# 종료 시그널 핸들러
cleanup() {
    echo ""
    echo "🛑 실제 로봇 관제 시스템을 종료합니다..."
    kill $WEB_SERVER_PID 2>/dev/null || true
    kill $TF_REPUBLISHER_PID 2>/dev/null || true
    kill $ROSBRIDGE_PID 2>/dev/null || true
    rm -f /tmp/robot_control_real.pid
    echo "✅ 종료 완료"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 포어그라운드에서 대기
wait