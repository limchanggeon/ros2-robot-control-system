#!/bin/bash

# 네이티브 데스크톱 관제 애플리케이션 시작 스크립트

echo "🖥️  네이티브 데스크톱 로봇 관제 시스템을 시작합니다..."

# ROS 2 환경 설정
source /opt/ros/humble/setup.bash

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 프로젝트 디렉토리: $PROJECT_DIR"

# Python 경로 설정
export PYTHONPATH="$PROJECT_DIR:$PYTHONPATH"

# PyQt5 설치 확인
if ! python3 -c "import PyQt5" 2>/dev/null; then
    echo "❌ PyQt5가 설치되지 않았습니다."
    echo "다음 명령으로 설치하세요:"
    echo "pip3 install PyQt5"
    echo "또는"
    echo "sudo apt install python3-pyqt5"
    exit 1
fi

# ROS 2 Python 라이브러리 확인
if ! python3 -c "import rclpy" 2>/dev/null; then
    echo "❌ ROS 2 Python 라이브러리가 설치되지 않았습니다."
    echo "ROS 2 환경이 올바르게 설정되었는지 확인하세요."
    exit 1
fi

# 로봇 아이콘 이미지 생성 (없는 경우)
ICON_PATH="$PROJECT_DIR/src/desktop/robot_icon.png"
if [ ! -f "$ICON_PATH" ]; then
    echo "🤖 로봇 아이콘을 생성합니다..."
    # 간단한 PNG 이미지 생성 (ImageMagick이 있는 경우)
    if command -v convert >/dev/null 2>&1; then
        convert -size 32x32 xc:transparent \
                -fill "#0066FF" -draw "circle 16,16 16,4" \
                -fill white -draw "polygon 16,8 12,20 20,20" \
                "$ICON_PATH"
        echo "✅ 로봇 아이콘이 생성되었습니다."
    else
        echo "⚠️  ImageMagick이 설치되지 않아 기본 아이콘을 사용합니다."
    fi
fi

# 필요한 초기화 파일 생성
touch "$PROJECT_DIR/src/__init__.py"
touch "$PROJECT_DIR/src/desktop/__init__.py"
touch "$PROJECT_DIR/src/desktop/gui/__init__.py"
touch "$PROJECT_DIR/src/desktop/gui/widgets/__init__.py"
touch "$PROJECT_DIR/src/desktop/utils/__init__.py"

echo "🚀 데스크톱 애플리케이션을 시작합니다..."

# 현재 디렉토리를 프로젝트 루트로 변경
cd "$PROJECT_DIR"

# 애플리케이션 실행
python3 -m src.desktop.main

echo "✅ 애플리케이션이 종료되었습니다."