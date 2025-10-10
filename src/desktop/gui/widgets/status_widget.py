"""
상태 표시 위젯
"""

from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
    QGroupBox, QGridLayout, QFrame
)
from PyQt5.QtCore import pyqtSlot, Qt
from PyQt5.QtGui import QFont, QPixmap, QPainter, QColor
from nav_msgs.msg import Odometry
import math


class StatusWidget(QWidget):
    """로봇 상태를 표시하는 위젯"""
    
    def __init__(self):
        super().__init__()
        self.init_ui()
        
    def init_ui(self):
        """UI 초기화"""
        layout = QVBoxLayout(self)
        
        # 연결 상태 그룹
        connection_group = QGroupBox("연결 상태")
        connection_layout = QGridLayout(connection_group)
        
        self.connection_status_label = QLabel("초기화 중...")
        self.connection_status_label.setStyleSheet("""
            QLabel {
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 3px;
                background-color: #f9f9f9;
            }
        """)
        connection_layout.addWidget(QLabel("ROS 연결:"), 0, 0)
        connection_layout.addWidget(self.connection_status_label, 0, 1)
        
        layout.addWidget(connection_group)
        
        # 로봇 상태 그룹
        robot_status_group = QGroupBox("로봇 상태")
        robot_layout = QGridLayout(robot_status_group)
        
        # 위치 정보
        robot_layout.addWidget(QLabel("위치 (X):"), 0, 0)
        self.pos_x_label = QLabel("0.00 m")
        robot_layout.addWidget(self.pos_x_label, 0, 1)
        
        robot_layout.addWidget(QLabel("위치 (Y):"), 1, 0)
        self.pos_y_label = QLabel("0.00 m")
        robot_layout.addWidget(self.pos_y_label, 1, 1)
        
        robot_layout.addWidget(QLabel("방향:"), 2, 0)
        self.orientation_label = QLabel("0.00°")
        robot_layout.addWidget(self.orientation_label, 2, 1)
        
        # 속도 정보
        robot_layout.addWidget(QLabel("선속도:"), 3, 0)
        self.linear_vel_label = QLabel("0.00 m/s")
        robot_layout.addWidget(self.linear_vel_label, 3, 1)
        
        robot_layout.addWidget(QLabel("각속도:"), 4, 0)
        self.angular_vel_label = QLabel("0.00 rad/s")
        robot_layout.addWidget(self.angular_vel_label, 4, 1)
        
        layout.addWidget(robot_status_group)
        
        # 시스템 정보 그룹
        system_group = QGroupBox("시스템 정보")
        system_layout = QGridLayout(system_group)
        
        system_layout.addWidget(QLabel("업타임:"), 0, 0)
        self.uptime_label = QLabel("00:00:00")
        system_layout.addWidget(self.uptime_label, 0, 1)
        
        system_layout.addWidget(QLabel("메시지 수신:"), 1, 0)
        self.message_count_label = QLabel("0")
        system_layout.addWidget(self.message_count_label, 1, 1)
        
        layout.addWidget(system_group)
        
        # 스타일 적용
        self.apply_styles()
        
        # 카운터 초기화
        self.message_count = 0
        
    def apply_styles(self):
        """스타일 적용"""
        labels = [
            self.pos_x_label, self.pos_y_label, self.orientation_label,
            self.linear_vel_label, self.angular_vel_label,
            self.uptime_label, self.message_count_label
        ]
        
        for label in labels:
            label.setStyleSheet("""
                QLabel {
                    padding: 3px;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    background-color: white;
                    font-family: monospace;
                }
            """)

    @pyqtSlot(str)
    def update_connection_status(self, status: str):
        """연결 상태 업데이트"""
        self.connection_status_label.setText(status)
        
        # 상태에 따른 색상 변경
        if "연결됨" in status:
            color = "#4CAF50"  # 초록색
        elif "오류" in status or "실패" in status:
            color = "#f44336"  # 빨간색
        else:
            color = "#ff9800"  # 주황색
            
        self.connection_status_label.setStyleSheet(f"""
            QLabel {{
                padding: 5px;
                border: 1px solid {color};
                border-radius: 3px;
                background-color: {color}20;
                color: {color};
                font-weight: bold;
            }}
        """)

    @pyqtSlot(object)
    def update_odometry(self, odom_msg: Odometry):
        """오도메트리 데이터 업데이트"""
        try:
            # 위치 정보
            pos = odom_msg.pose.pose.position
            self.pos_x_label.setText(f"{pos.x:.2f} m")
            self.pos_y_label.setText(f"{pos.y:.2f} m")
            
            # 방향 정보 (쿼터니언을 오일러각으로 변환)
            orientation = odom_msg.pose.pose.orientation
            yaw = math.atan2(
                2.0 * (orientation.w * orientation.z + orientation.x * orientation.y),
                1.0 - 2.0 * (orientation.y * orientation.y + orientation.z * orientation.z)
            )
            self.orientation_label.setText(f"{math.degrees(yaw):.1f}°")
            
            # 속도 정보
            linear_vel = odom_msg.twist.twist.linear
            angular_vel = odom_msg.twist.twist.angular
            
            # 전체 선속도 계산
            total_linear_vel = math.sqrt(
                linear_vel.x**2 + linear_vel.y**2 + linear_vel.z**2
            )
            self.linear_vel_label.setText(f"{total_linear_vel:.2f} m/s")
            self.angular_vel_label.setText(f"{angular_vel.z:.2f} rad/s")
            
            # 메시지 카운터 업데이트
            self.message_count += 1
            self.message_count_label.setText(str(self.message_count))
            
        except Exception as e:
            print(f"오도메트리 업데이트 오류: {e}")

    def update_uptime(self, uptime_str: str):
        """업타임 업데이트"""
        self.uptime_label.setText(uptime_str)