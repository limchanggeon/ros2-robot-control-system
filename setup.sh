#!/bin/bash

# ROS 2 로봇 관제 시스템 환경 설정 스크립트

echo "🚀 ROS 2 로봇 관제 시스템 환경 설정을 시작합니다..."

# ROS 2 환경 체크
if [ -z "$ROS_DISTRO" ]; then
    echo "❌ ROS 2 환경이 설정되지 않았습니다."
    echo "다음 명령을 실행하여 ROS 2 환경을 설정하세요:"
    echo "source /opt/ros/humble/setup.bash"
    exit 1
fi

echo "✅ ROS 2 $ROS_DISTRO 환경이 감지되었습니다."

# 필요한 ROS 2 패키지 설치
echo "📦 필요한 ROS 2 패키지를 설치합니다..."
sudo apt update
sudo apt install -y \
    ros-$ROS_DISTRO-rosbridge-server \
    ros-$ROS_DISTRO-tf2-web-republisher \
    ros-$ROS_DISTRO-turtlebot3 \
    ros-$ROS_DISTRO-turtlebot3-simulations \
    ros-$ROS_DISTRO-navigation2 \
    ros-$ROS_DISTRO-nav2-bringup \
    python3-pip

# Python 의존성 설치
echo "🐍 Python 의존성을 설치합니다..."
pip3 install -r requirements.txt

# 디렉토리 권한 설정
chmod +x scripts/*.sh

# TurtleBot3 모델 환경변수 설정 (기본값)
if [ -z "$TURTLEBOT3_MODEL" ]; then
    echo "export TURTLEBOT3_MODEL=burger" >> ~/.bashrc
    export TURTLEBOT3_MODEL=burger
    echo "✅ TURTLEBOT3_MODEL이 'burger'로 설정되었습니다."
fi

# 작업공간 빌드 (필요시)
if [ -f "package.xml" ]; then
    echo "🔨 ROS 2 패키지를 빌드합니다..."
    colcon build
    source install/setup.bash
fi

echo "🎉 환경 설정이 완료되었습니다!"
echo ""
echo "다음 명령으로 시스템을 시작할 수 있습니다:"
echo "  웹 기반 시스템:     ./scripts/start_web_server.sh"
echo "  데스크톱 앱:        ./scripts/start_desktop_app.sh"
echo ""
echo "시뮬레이션 환경을 시작하려면:"
echo "  ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py"