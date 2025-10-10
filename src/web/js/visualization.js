/**
 * 시각화 모듈
 * ROS2DJS와 ROS3DJS를 사용한 2D/3D 시각화 관리
 */

class VisualizationManager {
    constructor() {
        this.mapViewer = null;
        this.robotViewer = null;
        this.gridClient = null;
        this.urdfClient = null;
        this.tfClient = null;
        
        this.currentMap = null;
        this.robotPose = { x: 0, y: 0, theta: 0 };
        this.laserScan = null;
        
        // 줌 및 패닝 상태
        this.zoomLevel = 1.0;
        this.panX = 0;
        this.panY = 0;
        
        this.isInitialized = false;
    }

    /**
     * 시각화 시스템 초기화
     */
    initialize() {
        try {
            this.initializeMapViewer();
            this.initializeRobotViewer();
            this.setupEventHandlers();
            this.isInitialized = true;
            console.log('시각화 시스템이 초기화되었습니다.');
        } catch (error) {
            console.error('시각화 시스템 초기화 오류:', error);
        }
    }

    /**
     * 2D 지도 뷰어 초기화
     */
    initializeMapViewer() {
        const container = document.getElementById('map-viewer');
        if (!container) {
            throw new Error('map-viewer 컨테이너를 찾을 수 없습니다.');
        }

        this.mapViewer = new ROS2D.Viewer({
            divID: 'map-viewer',
            width: container.clientWidth,
            height: container.clientHeight
        });

        // 윈도우 리사이즈 핸들러
        window.addEventListener('resize', () => {
            this.resizeViewers();
        });

        console.log('2D 지도 뷰어가 초기화되었습니다.');
    }

    /**
     * 3D 로봇 뷰어 초기화
     */
    initializeRobotViewer() {
        const container = document.getElementById('robot-viewer');
        if (!container) {
            throw new Error('robot-viewer 컨테이너를 찾을 수 없습니다.');
        }

        this.robotViewer = new ROS3D.Viewer({
            divID: 'robot-viewer',
            width: container.clientWidth,
            height: container.clientHeight,
            antialias: true,
            background: 'transparent',
            backgroundAlpha: 0.0
        });

        // 카메라를 위에서 내려다보는 시점으로 설정
        this.robotViewer.camera.position.set(0, 0, 15);
        this.robotViewer.camera.lookAt(0, 0, 0);

        console.log('3D 로봇 뷰어가 초기화되었습니다.');
    }

    /**
     * 이벤트 핸들러 설정
     */
    setupEventHandlers() {
        // 줌 인
        document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
            this.zoomIn();
        });

        // 줌 아웃
        document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
            this.zoomOut();
        });

        // 뷰 리셋
        document.getElementById('reset-view-btn')?.addEventListener('click', () => {
            this.resetView();
        });

        // 마우스 휠 줌
        const viewerContainer = document.getElementById('viewer-container');
        if (viewerContainer) {
            viewerContainer.addEventListener('wheel', (event) => {
                event.preventDefault();
                if (event.deltaY < 0) {
                    this.zoomIn();
                } else {
                    this.zoomOut();
                }
            });
        }
    }

    /**
     * ROS 클라이언트와 연결
     */
    connectToRos(rosClient) {
        if (!this.isInitialized) {
            console.error('시각화 시스템이 초기화되지 않았습니다.');
            return;
        }

        // TF 클라이언트 설정
        if (rosClient.tfClient) {
            this.tfClient = rosClient.tfClient;
            this.initializeUrdfClient(rosClient.ros);
        }

        // 지도 클라이언트 설정
        this.initializeGridClient(rosClient.ros);

        console.log('시각화 시스템이 ROS에 연결되었습니다.');
    }

    /**
     * 지도 클라이언트 초기화
     */
    initializeGridClient(ros) {
        this.gridClient = new ROS2D.OccupancyGridClient({
            ros: ros,
            rootObject: this.mapViewer.scene,
            continuous: true
        });

        this.gridClient.on('change', () => {
            console.log('지도가 업데이트되었습니다.');
            if (this.gridClient.currentGrid) {
                this.currentMap = this.gridClient.currentGrid;
                this.fitMapToView();
            }
        });
    }

    /**
     * URDF 클라이언트 초기화
     */
    initializeUrdfClient(ros) {
        if (!this.tfClient) {
            console.warn('TF 클라이언트가 없어 URDF 시각화를 건너뜁니다.');
            return;
        }

        try {
            this.urdfClient = new ROS3D.UrdfClient({
                ros: ros,
                tfClient: this.tfClient,
                path: 'http://resources.robotwebtools.org/',
                rootObject: this.robotViewer.scene,
                loader: ROS3D.COLLADA_LOADER_2
            });

            console.log('URDF 클라이언트가 초기화되었습니다.');
        } catch (error) {
            console.warn('URDF 클라이언트 초기화 실패:', error);
        }
    }

    /**
     * 지도를 뷰에 맞게 조정
     */
    fitMapToView() {
        if (!this.currentMap || !this.mapViewer) {
            return;
        }

        try {
            this.mapViewer.scaleToDimensions(
                this.currentMap.width,
                this.currentMap.height
            );
            
            this.mapViewer.shift(
                this.currentMap.pose.position.x,
                this.currentMap.pose.position.y
            );

            console.log('지도가 뷰에 맞춰졌습니다.');
        } catch (error) {
            console.error('지도 피팅 오류:', error);
        }
    }

    /**
     * 로봇 포즈 업데이트
     */
    updateRobotPose(x, y, theta) {
        this.robotPose = { x, y, theta };
        this.updateCoordinateDisplay(x, y, theta);
    }

    /**
     * 좌표 표시 업데이트
     */
    updateCoordinateDisplay(x, y, theta) {
        const xElement = document.getElementById('robot-x');
        const yElement = document.getElementById('robot-y');
        const thetaElement = document.getElementById('robot-theta');

        if (xElement) xElement.textContent = x.toFixed(2);
        if (yElement) yElement.textContent = y.toFixed(2);
        if (thetaElement) thetaElement.textContent = (theta * 180 / Math.PI).toFixed(1);
    }

    /**
     * 라이다 스캔 업데이트
     */
    updateLaserScan(scanData) {
        this.laserScan = scanData;
        // 라이다 스캔 시각화는 ROS3DJS의 LaserScan 디스플레이를 사용하거나
        // 커스텀 구현 필요
    }

    /**
     * 줌 인
     */
    zoomIn() {
        this.zoomLevel *= 1.2;
        this.applyZoom();
    }

    /**
     * 줌 아웃
     */
    zoomOut() {
        this.zoomLevel /= 1.2;
        this.applyZoom();
    }

    /**
     * 줌 적용
     */
    applyZoom() {
        if (this.mapViewer && this.mapViewer.scene) {
            this.mapViewer.scene.scaleX = this.zoomLevel;
            this.mapViewer.scene.scaleY = this.zoomLevel;
        }

        if (this.robotViewer && this.robotViewer.camera) {
            const baseHeight = 15;
            this.robotViewer.camera.position.z = baseHeight / this.zoomLevel;
        }

        console.log(`줌 레벨: ${this.zoomLevel.toFixed(2)}`);
    }

    /**
     * 뷰 리셋
     */
    resetView() {
        this.zoomLevel = 1.0;
        this.panX = 0;
        this.panY = 0;
        
        if (this.currentMap) {
            this.fitMapToView();
        }
        
        this.applyZoom();
        console.log('뷰가 리셋되었습니다.');
    }

    /**
     * 뷰어 크기 조정
     */
    resizeViewers() {
        const mapContainer = document.getElementById('map-viewer');
        const robotContainer = document.getElementById('robot-viewer');

        if (mapContainer && this.mapViewer) {
            this.mapViewer.resize(mapContainer.clientWidth, mapContainer.clientHeight);
        }

        if (robotContainer && this.robotViewer) {
            this.robotViewer.resize(robotContainer.clientWidth, robotContainer.clientHeight);
        }
    }

    /**
     * 월드 좌표를 스크린 좌표로 변환
     */
    worldToScreen(worldX, worldY) {
        if (!this.currentMap) {
            return { x: 0, y: 0 };
        }

        // 구현 필요: 지도 해상도와 원점을 고려한 좌표 변환
        const resolution = this.currentMap.info ? this.currentMap.info.resolution : 0.05;
        const originX = this.currentMap.pose ? this.currentMap.pose.position.x : 0;
        const originY = this.currentMap.pose ? this.currentMap.pose.position.y : 0;

        const screenX = (worldX - originX) / resolution;
        const screenY = (worldY - originY) / resolution;

        return { x: screenX, y: screenY };
    }

    /**
     * 스크린 좌표를 월드 좌표로 변환
     */
    screenToWorld(screenX, screenY) {
        if (!this.currentMap) {
            return { x: 0, y: 0 };
        }

        const resolution = this.currentMap.info ? this.currentMap.info.resolution : 0.05;
        const originX = this.currentMap.pose ? this.currentMap.pose.position.x : 0;
        const originY = this.currentMap.pose ? this.currentMap.pose.position.y : 0;

        const worldX = screenX * resolution + originX;
        const worldY = screenY * resolution + originY;

        return { x: worldX, y: worldY };
    }

    /**
     * 시각화 시스템 종료
     */
    cleanup() {
        if (this.gridClient) {
            this.gridClient.unsubscribe();
        }
        
        console.log('시각화 시스템이 정리되었습니다.');
    }
}

// 전역 시각화 매니저 인스턴스
window.visualizationManager = new VisualizationManager();