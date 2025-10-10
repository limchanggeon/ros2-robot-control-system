"""
로봇 제어 위젯
"""

from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
    QGroupBox, QPushButton, QLineEdit, QGridLayout,
    QDoubleSpinBox, QSlider
)
from PyQt5.QtCore import pyqtSignal, Qt
from PyQt5.QtGui import QFont
import math


class ControlWidget(QWidget):
    """로봇 제어를 위한 위젯"""
    
    # 시그널 정의
    goal_requested = pyqtSignal(float, float, float)  # x, y, yaw
    
    def __init__(self):
        super().__init__()
        self.init_ui()
        
    def init_ui(self):
        """UI 초기화"""
        layout = QVBoxLayout(self)
        
        # 목표 지점 설정 그룹
        goal_group = QGroupBox("목표 지점 설정")
        goal_layout = QGridLayout(goal_group)
        
        # X 좌표
        goal_layout.addWidget(QLabel("X (m):"), 0, 0)
        self.goal_x_spinbox = QDoubleSpinBox()
        self.goal_x_spinbox.setRange(-50.0, 50.0)
        self.goal_x_spinbox.setDecimals(2)
        self.goal_x_spinbox.setSingleStep(0.1)
        goal_layout.addWidget(self.goal_x_spinbox, 0, 1)
        
        # Y 좌표
        goal_layout.addWidget(QLabel("Y (m):"), 1, 0)
        self.goal_y_spinbox = QDoubleSpinBox()
        self.goal_y_spinbox.setRange(-50.0, 50.0)
        self.goal_y_spinbox.setDecimals(2)
        self.goal_y_spinbox.setSingleStep(0.1)
        goal_layout.addWidget(self.goal_y_spinbox, 1, 1)
        
        # 방향 (yaw)
        goal_layout.addWidget(QLabel("방향 (°):"), 2, 0)
        self.goal_yaw_spinbox = QDoubleSpinBox()
        self.goal_yaw_spinbox.setRange(-180.0, 180.0)
        self.goal_yaw_spinbox.setDecimals(1)
        self.goal_yaw_spinbox.setSingleStep(5.0)
        goal_layout.addWidget(self.goal_yaw_spinbox, 2, 1)
        
        # 목표 지점 전송 버튼
        self.send_goal_button = QPushButton("목표 지점 전송")
        self.send_goal_button.clicked.connect(self.send_goal)
        goal_layout.addWidget(self.send_goal_button, 3, 0, 1, 2)
        
        layout.addWidget(goal_group)
        
        # 빠른 명령 그룹
        quick_commands_group = QGroupBox("빠른 명령")
        quick_layout = QGridLayout(quick_commands_group)
        
        # 현재 위치 기준 이동 버튼들
        self.move_forward_btn = QPushButton("전진 (1m)")
        self.move_forward_btn.clicked.connect(lambda: self.relative_move(1.0, 0.0, 0.0))
        quick_layout.addWidget(self.move_forward_btn, 0, 1)
        
        self.move_left_btn = QPushButton("좌측 (1m)")
        self.move_left_btn.clicked.connect(lambda: self.relative_move(0.0, 1.0, 0.0))
        quick_layout.addWidget(self.move_left_btn, 1, 0)
        
        self.stop_btn = QPushButton("정지")
        self.stop_btn.clicked.connect(self.stop_robot)
        self.stop_btn.setStyleSheet("""
            QPushButton {
                background-color: #f44336;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #d32f2f;
            }
        """)
        quick_layout.addWidget(self.stop_btn, 1, 1)
        
        self.move_right_btn = QPushButton("우측 (1m)")
        self.move_right_btn.clicked.connect(lambda: self.relative_move(0.0, -1.0, 0.0))
        quick_layout.addWidget(self.move_right_btn, 1, 2)
        
        self.move_backward_btn = QPushButton("후진 (1m)")
        self.move_backward_btn.clicked.connect(lambda: self.relative_move(-1.0, 0.0, 0.0))
        quick_layout.addWidget(self.move_backward_btn, 2, 1)
        
        # 회전 버튼들
        self.rotate_left_btn = QPushButton("좌회전 (90°)")
        self.rotate_left_btn.clicked.connect(lambda: self.relative_move(0.0, 0.0, 90.0))
        quick_layout.addWidget(self.rotate_left_btn, 3, 0)
        
        self.rotate_right_btn = QPushButton("우회전 (90°)")
        self.rotate_right_btn.clicked.connect(lambda: self.relative_move(0.0, 0.0, -90.0))
        quick_layout.addWidget(self.rotate_right_btn, 3, 2)
        
        layout.addWidget(quick_commands_group)
        
        # 미리 정의된 위치 그룹
        preset_group = QGroupBox("미리 정의된 위치")
        preset_layout = QVBoxLayout(preset_group)
        
        # 홈 위치로 이동
        self.go_home_btn = QPushButton("홈 위치 (0, 0)")
        self.go_home_btn.clicked.connect(lambda: self.send_absolute_goal(0.0, 0.0, 0.0))
        preset_layout.addWidget(self.go_home_btn)
        
        # 커스텀 위치들 (예시)
        preset_positions = [
            ("위치 A", 2.0, 2.0, 0.0),
            ("위치 B", -2.0, 2.0, 90.0),
            ("위치 C", 0.0, -2.0, 180.0)
        ]
        
        for name, x, y, yaw in preset_positions:
            btn = QPushButton(f"{name} ({x}, {y})")
            btn.clicked.connect(lambda checked, x=x, y=y, yaw=yaw: self.send_absolute_goal(x, y, yaw))
            preset_layout.addWidget(btn)
        
        layout.addWidget(preset_group)
        
        # 변수 초기화
        self.current_robot_pose = (0.0, 0.0, 0.0)
        
    def send_goal(self):
        """목표 지점 전송"""
        x = self.goal_x_spinbox.value()
        y = self.goal_y_spinbox.value()
        yaw = math.radians(self.goal_yaw_spinbox.value())
        
        self.goal_requested.emit(x, y, yaw)
        print(f"목표 지점 전송: x={x:.2f}, y={y:.2f}, yaw={math.degrees(yaw):.1f}°")
        
    def send_absolute_goal(self, x: float, y: float, yaw_degrees: float):
        """절대 좌표로 목표 지점 전송"""
        yaw = math.radians(yaw_degrees)
        self.goal_requested.emit(x, y, yaw)
        print(f"절대 목표 지점 전송: x={x:.2f}, y={y:.2f}, yaw={yaw_degrees:.1f}°")
        
    def relative_move(self, delta_x: float, delta_y: float, delta_yaw_degrees: float):
        """현재 위치 기준 상대 이동"""
        current_x, current_y, current_yaw = self.current_robot_pose
        
        # 현재 방향을 고려한 상대 이동 계산
        cos_yaw = math.cos(current_yaw)
        sin_yaw = math.sin(current_yaw)
        
        # 로봇 좌표계에서 월드 좌표계로 변환
        world_delta_x = delta_x * cos_yaw - delta_y * sin_yaw
        world_delta_y = delta_x * sin_yaw + delta_y * cos_yaw
        
        new_x = current_x + world_delta_x
        new_y = current_y + world_delta_y
        new_yaw = current_yaw + math.radians(delta_yaw_degrees)
        
        # 각도 정규화 (-π to π)
        while new_yaw > math.pi:
            new_yaw -= 2 * math.pi
        while new_yaw < -math.pi:
            new_yaw += 2 * math.pi
            
        self.goal_requested.emit(new_x, new_y, new_yaw)
        print(f"상대 이동: Δx={delta_x:.1f}, Δy={delta_y:.1f}, Δyaw={delta_yaw_degrees:.1f}°")
        print(f"새 목표: x={new_x:.2f}, y={new_y:.2f}, yaw={math.degrees(new_yaw):.1f}°")
        
    def stop_robot(self):
        """로봇 정지 (현재 위치로 목표 설정)"""
        current_x, current_y, current_yaw = self.current_robot_pose
        self.goal_requested.emit(current_x, current_y, current_yaw)
        print("로봇 정지 명령 전송")
        
    def update_robot_pose(self, x: float, y: float, yaw: float):
        """현재 로봇 위치 업데이트 (다른 위젯에서 호출)"""
        self.current_robot_pose = (x, y, yaw)