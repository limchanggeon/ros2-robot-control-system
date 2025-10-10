"""
지도 및 로봇 시각화 위젯
"""

import numpy as np
import math
from PyQt5.QtWidgets import QWidget, QLabel, QVBoxLayout
from PyQt5.QtCore import pyqtSlot, Qt
from PyQt5.QtGui import QPixmap, QImage, QPainter, QTransform, QPen, QColor
from nav_msgs.msg import OccupancyGrid
from sensor_msgs.msg import LaserScan


class MapWidget(QWidget):
    """지도와 로봇을 시각화하는 위젯"""
    
    def __init__(self):
        super().__init__()
        self.map_label = QLabel("지도 로딩 중...")
        self.map_label.setAlignment(Qt.AlignCenter)
        self.map_label.setMinimumSize(600, 400)
        self.map_label.setStyleSheet("""
            QLabel {
                border: 1px solid #cccccc;
                background-color: white;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.addWidget(self.map_label)
        
        # 데이터 저장 변수들
        self.map_pixmap = None
        self.map_info = None
        self.robot_pose = (0, 0, 0)  # x, y, yaw
        self.laser_scan_data = None
        
        # 로봇 아이콘 생성 (프로그래밍 방식으로)
        self.robot_pixmap = self.create_robot_icon()
        
    def create_robot_icon(self):
        """프로그래밍 방식으로 로봇 아이콘 생성"""
        pixmap = QPixmap(32, 32)
        pixmap.fill(Qt.transparent)
        
        painter = QPainter(pixmap)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 로봇 몸체 (원)
        painter.setBrush(QColor(0, 100, 255))
        painter.setPen(QPen(QColor(0, 50, 200), 2))
        painter.drawEllipse(2, 2, 28, 28)
        
        # 방향 표시 (삼각형)
        painter.setBrush(QColor(255, 255, 255))
        painter.drawPolygon([
            (16, 8),   # 꼭지점
            (12, 20),  # 왼쪽 아래
            (20, 20)   # 오른쪽 아래
        ])
        
        painter.end()
        return pixmap

    @pyqtSlot(object)
    def update_map(self, map_msg: OccupancyGrid):
        """맵 이미지를 생성하고 표시하는 슬롯"""
        try:
            self.map_info = map_msg.info
            width = self.map_info.width
            height = self.map_info.height
            
            # OccupancyGrid 데이터를 이미지로 변환
            data = np.array(map_msg.data, dtype=np.int8).reshape((height, width))
            image_data = np.zeros((height, width), dtype=np.uint8)
            
            # 점유(100) -> 검정(0), 비점유(0) -> 흰색(255), 알수없음(-1) -> 회색(127)
            image_data[data == 100] = 0      # 점유된 공간
            image_data[data == 0] = 255      # 자유 공간
            image_data[data == -1] = 127     # 알 수 없는 공간
            
            # QImage 생성 (Y축 뒤집기)
            flipped_data = np.flipud(image_data)
            q_image = QImage(
                flipped_data.data,
                width,
                height,
                width,
                QImage.Format_Grayscale8
            )
            
            self.map_pixmap = QPixmap.fromImage(q_image)
            self.redraw_display()
            
        except Exception as e:
            print(f"맵 업데이트 오류: {e}")

    @pyqtSlot(float, float, float)
    def update_robot_pose(self, x: float, y: float, yaw: float):
        """로봇 위치를 업데이트하고 다시 그리는 슬롯"""
        self.robot_pose = (x, y, yaw)
        self.redraw_display()

    @pyqtSlot(object)
    def update_laser_scan(self, scan_msg: LaserScan):
        """라이다 스캔 데이터 업데이트"""
        self.laser_scan_data = scan_msg
        self.redraw_display()

    def redraw_display(self):
        """맵, 로봇, 라이다 스캔을 합쳐서 화면에 표시"""
        if self.map_pixmap is None or self.map_info is None:
            return
            
        # 맵을 복사하여 그 위에 요소들을 그림
        display_pixmap = self.map_pixmap.copy()
        painter = QPainter(display_pixmap)
        painter.setRenderHint(QPainter.Antialiasing)
        
        try:
            # 월드 좌표를 픽셀 좌표로 변환
            px, py = self.world_to_pixel(
                self.robot_pose[0], 
                self.robot_pose[1]
            )
            
            # 라이다 스캔 데이터 그리기
            if self.laser_scan_data:
                self.draw_laser_scan(painter, px, py, self.robot_pose[2])
            
            # 로봇 아이콘 회전 및 그리기
            transform = QTransform()
            transform.translate(px, py)
            transform.rotate(-math.degrees(self.robot_pose[2]))  # yaw 회전
            transform.translate(
                -self.robot_pixmap.width() / 2,
                -self.robot_pixmap.height() / 2
            )
            
            painter.setTransform(transform)
            painter.drawPixmap(0, 0, self.robot_pixmap)
            
        except Exception as e:
            print(f"디스플레이 그리기 오류: {e}")
        finally:
            painter.end()
            
        # 위젯 크기에 맞게 스케일링
        scaled_pixmap = display_pixmap.scaled(
            self.map_label.size(),
            Qt.KeepAspectRatio,
            Qt.SmoothTransformation
        )
        
        self.map_label.setPixmap(scaled_pixmap)

    def world_to_pixel(self, world_x: float, world_y: float):
        """월드 좌표를 픽셀 좌표로 변환"""
        if not self.map_info:
            return 0, 0
            
        # 맵 원점을 기준으로 한 상대 위치 계산
        relative_x = world_x - self.map_info.origin.position.x
        relative_y = world_y - self.map_info.origin.position.y
        
        # 픽셀 좌표로 변환
        px = relative_x / self.map_info.resolution
        py = self.map_info.height - (relative_y / self.map_info.resolution)
        
        return int(px), int(py)

    def draw_laser_scan(self, painter: QPainter, robot_px: int, robot_py: int, robot_yaw: float):
        """라이다 스캔 데이터를 그리기"""
        if not self.laser_scan_data:
            return
            
        painter.setPen(QPen(QColor(255, 0, 0, 128), 1))  # 반투명 빨간색
        
        angle = self.laser_scan_data.angle_min
        for i, range_val in enumerate(self.laser_scan_data.ranges):
            if (self.laser_scan_data.range_min <= range_val <= self.laser_scan_data.range_max):
                # 라이다 포인트의 월드 좌표 계산
                world_x = (
                    self.robot_pose[0] + 
                    range_val * math.cos(robot_yaw + angle)
                )
                world_y = (
                    self.robot_pose[1] + 
                    range_val * math.sin(robot_yaw + angle)
                )
                
                # 픽셀 좌표로 변환
                px, py = self.world_to_pixel(world_x, world_y)
                
                # 포인트 그리기
                painter.drawPoint(px, py)
                
            angle += self.laser_scan_data.angle_increment