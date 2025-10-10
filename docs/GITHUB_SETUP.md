# GitHub에 저장소 업로드 및 UTM에서 클론하는 방법

## 🚀 GitHub 저장소 생성 및 업로드

### 1. GitHub에서 새 저장소 생성
1. [GitHub](https://github.com)에 로그인
2. "New repository" 클릭
3. Repository name: `ros2-robot-control-system`
4. Description: `TurtleBot3 기반 ROS 2 로봇 관제 시스템`
5. Public/Private 선택
6. "Create repository" 클릭

### 2. 로컬 저장소를 GitHub에 푸시
```bash
# 현재 ros_system 디렉토리에서 실행
cd /Users/limchang-geon/Desktop/ros_system

# GitHub 저장소를 원격 저장소로 추가 (URL은 실제 생성된 저장소 URL로 변경)
git remote add origin https://github.com/YOUR_USERNAME/ros2-robot-control-system.git

# main 브랜치로 푸시
git push -u origin main
```

## 🖥️ UTM 가상환경에서 클론하기

### 1. UTM에서 Ubuntu 22.04 VM 실행

### 2. 기본 도구 설치
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Git 설치
sudo apt install git -y
```

### 3. 저장소 클론
```bash
# 홈 디렉토리로 이동
cd ~

# 저장소 클론 (실제 GitHub URL로 변경)
git clone https://github.com/YOUR_USERNAME/ros2-robot-control-system.git

# 디렉토리 이동
cd ros2-robot-control-system

# 파일 권한 설정
chmod +x setup.sh
chmod +x scripts/*.sh
```

### 4. ROS 2 및 의존성 설치
```bash
# ROS 2 Humble 설치 (자세한 내용은 docs/UTM_SETUP.md 참조)
# 간단 설치 스크립트 실행
./setup.sh
```

### 5. 시스템 실행
```bash
# 웹 기반 관제 시스템
./scripts/start_web_server.sh

# 또는 데스크톱 앱
./scripts/start_desktop_app.sh
```

## 🔄 개발 워크플로우

### macOS에서 개발 후 UTM으로 동기화
```bash
# macOS에서 변경사항 커밋 및 푸시
git add .
git commit -m "Feature: 새로운 기능 추가"
git push origin main

# UTM에서 최신 변경사항 가져오기
cd ~/ros2-robot-control-system
git pull origin main
```

이제 완전한 ROS 2 로봇 관제 시스템이 Git으로 관리되며, UTM 가상환경에서 쉽게 클론하여 사용할 수 있습니다! 🎉