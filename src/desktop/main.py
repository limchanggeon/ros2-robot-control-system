"""
ROS 2 로봇 관제 시스템 - 네이티브 데스크톱 애플리케이션
메인 실행 파일
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from PyQt5.QtWidgets import QApplication
from src.desktop.gui.main_window import MainWindow


def main():
    """메인 애플리케이션 실행 함수"""
    app = QApplication(sys.argv)
    app.setApplicationName("ROS 2 Robot Control System")
    app.setOrganizationName("ROS Control Team")
    
    # 메인 윈도우 생성 및 표시
    window = MainWindow()
    window.show()
    
    # 애플리케이션 실행
    sys.exit(app.exec_())


if __name__ == '__main__':
    main()