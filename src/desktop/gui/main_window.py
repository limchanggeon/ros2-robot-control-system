"""
메인 GUI 윈도우 클래스
"""

import os
from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
    QLabel, QPushButton, QStatusBar, QGroupBox,
    QGridLayout, QFrame, QSplitter
)
from PyQt5.QtCore import QThread, pyqtSlot, Qt
from PyQt5.QtGui import QPixmap, QFont, QPalette

from ..ros_worker import RosNodeWorker
from .widgets.map_widget import MapWidget
from .widgets.status_widget import StatusWidget
from .widgets.control_widget import ControlWidget


class MainWindow(QMainWindow):
    """메인 GUI 윈도우 클래스"""

    def __init__(self):
        super().__init__()
        self.ros_thread = None
        self.ros_worker = None
        
        self.init_ui()
        self.setup_ros_thread()
        
    def init_ui(self):
        """UI 초기화"""
        self.setWindowTitle("ROS 2 로봇 관제 시스템")
        self.setGeometry(100, 100, 1200, 800)
        
        # 중앙 위젯 설정
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 메인 레이아웃 (수직 분할)
        main_splitter = QSplitter(Qt.Horizontal)
        central_widget_layout = QVBoxLayout(central_widget)
        central_widget_layout.addWidget(main_splitter)
        
        # 왼쪽 패널 (지도 및 시각화)
        left_panel = self.create_left_panel()
        main_splitter.addWidget(left_panel)
        
        # 오른쪽 패널 (상태 및 제어)
        right_panel = self.create_right_panel()
        main_splitter.addWidget(right_panel)
        
        # 분할 비율 설정 (왼쪽:오른쪽 = 3:1)
        main_splitter.setSizes([900, 300])
        
        # 상태바 설정
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.showMessage("시스템 초기화 중...")
        
        # 스타일 적용
        self.apply_styles()
        
    def create_left_panel(self):
        """왼쪽 패널 생성 (지도 및 시각화)"""
        left_widget = QWidget()
        layout = QVBoxLayout(left_widget)
        
        # 지도 위젯
        map_group = QGroupBox("로봇 위치 및 지도")
        map_layout = QVBoxLayout(map_group)
        
        self.map_widget = MapWidget()
        map_layout.addWidget(self.map_widget)
        
        layout.addWidget(map_group)
        
        return left_widget
        
    def create_right_panel(self):
        """오른쪽 패널 생성 (상태 및 제어)"""
        right_widget = QWidget()
        layout = QVBoxLayout(right_widget)
        
        # 상태 위젯
        self.status_widget = StatusWidget()
        layout.addWidget(self.status_widget)
        
        # 제어 위젯  
        self.control_widget = ControlWidget()
        layout.addWidget(self.control_widget)
        
        # 빈 공간 추가
        layout.addStretch()
        
        return right_widget
        
    def apply_styles(self):
        """스타일 적용"""
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f0f0f0;
            }
            QGroupBox {
                font-weight: bold;
                border: 2px solid #cccccc;
                border-radius: 5px;
                margin-top: 10px;
                padding-top: 10px;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px 0 5px;
            }
            QPushButton {
                background-color: #4CAF50;
                border: none;
                color: white;
                padding: 8px 16px;
                text-align: center;
                font-size: 14px;
                border-radius: 4px;
            }
            QPushButton:hover {
                background-color: #45a049;
            }
            QPushButton:pressed {
                background-color: #3e8e41;
            }
            QPushButton:disabled {
                background-color: #cccccc;
                color: #666666;
            }
        """)

    def setup_ros_thread(self):
        """ROS 워커를 위한 QThread 설정"""
        self.ros_thread = QThread()
        self.ros_worker = RosNodeWorker()
        self.ros_worker.moveToThread(self.ros_thread)
        
        # 스레드 시작 시 워커의 run 함수 실행 연결
        self.ros_thread.started.connect(self.ros_worker.run)
        
        # 워커의 시그널을 메인 윈도우의 슬롯에 연결
        self.ros_worker.map_updated.connect(self.map_widget.update_map)
        self.ros_worker.robot_pose_updated.connect(self.map_widget.update_robot_pose)
        self.ros_worker.laser_scan_updated.connect(self.map_widget.update_laser_scan)
        self.ros_worker.odometry_updated.connect(self.status_widget.update_odometry)
        self.ros_worker.connection_status_changed.connect(self.update_connection_status)
        self.ros_worker.error_occurred.connect(self.handle_error)
        
        # 제어 위젯에서 워커로의 연결
        self.control_widget.goal_requested.connect(self.ros_worker.publish_goal)
        
        # 스레드 시작
        self.ros_thread.start()

    @pyqtSlot(str)
    def update_connection_status(self, status: str):
        """연결 상태 업데이트"""
        self.status_bar.showMessage(f"ROS 연결 상태: {status}")
        self.status_widget.update_connection_status(status)

    @pyqtSlot(str)
    def handle_error(self, error_message: str):
        """에러 처리"""
        self.status_bar.showMessage(f"오류: {error_message}")
        print(f"ROS 오류: {error_message}")

    def closeEvent(self, event):
        """윈도우 종료 시 스레드 정리"""
        if self.ros_worker:
            self.ros_worker.stop()
        if self.ros_thread:
            self.ros_thread.quit()
            self.ros_thread.wait(3000)  # 3초 대기
            
        super().closeEvent(event)