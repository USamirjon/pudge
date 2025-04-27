import React, { useState, useRef } from 'react';
import mammoth from 'mammoth';

const HtmlEditor = ({ value, onChange, label }) => {
    const [htmlContent, setHtmlContent] = useState(value || '');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const fileInputRef = useRef(null);
    const [pendingImages, setPendingImages] = useState([]);
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentImageUrl, setCurrentImageUrl] = useState('');

    // Обработка изменений в текстовом редакторе
    const handleEditorChange = (e) => {
        const newValue = e.target.value;
        setHtmlContent(newValue);
        onChange(newValue);
    };

    // Функция для обработки HTML и поиска изображений
    const processHtmlWithImages = (html) => {
        // Создаем временный DOM для работы с HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Находим все изображения в документе
        const images = tempDiv.querySelectorAll('img');
        if (images.length > 0) {
            // Сохраняем изображения для последующей обработки
            const imageNodes = Array.from(images);
            setPendingImages(imageNodes);
            setCurrentImageIndex(0);
            setShowImageModal(true);

            // Вернем HTML без замены изображений пока
            return html;
        }

        return html;
    };

    // Загрузка DOCX файла и конвертация в HTML
    const handleDocxUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const arrayBuffer = event.target.result;

            mammoth.convertToHtml({ arrayBuffer })
                .then((result) => {
                    const html = result.value;
                    const processedHtml = processHtmlWithImages(html);
                    setHtmlContent(processedHtml);
                    onChange(processedHtml);
                    console.log("Предупреждения:", result.messages);
                })
                .catch((error) => {
                    console.error("Ошибка конвертации:", error);
                    alert("Произошла ошибка при конвертации документа: " + error.message);
                });
        };

        reader.readAsArrayBuffer(file);
    };

    // Обработка подтверждения URL для изображения
    const handleImageUrlConfirm = () => {
        if (currentImageUrl && pendingImages[currentImageIndex]) {
            // Создаем копию текущего HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;

            // Находим все изображения в текущем HTML
            const images = tempDiv.querySelectorAll('img');
            if (images[currentImageIndex]) {
                // Заменяем src на указанный URL
                images[currentImageIndex].src = currentImageUrl;
                images[currentImageIndex].removeAttribute('width');
                images[currentImageIndex].removeAttribute('height');
                images[currentImageIndex].style = 'max-width: 100%';

                // Обновляем HTML
                const updatedHtml = tempDiv.innerHTML;
                setHtmlContent(updatedHtml);
                onChange(updatedHtml);
            }

            // Переходим к следующему изображению или закрываем модальное окно
            if (currentImageIndex < pendingImages.length - 1) {
                setCurrentImageIndex(currentImageIndex + 1);
                setCurrentImageUrl('');
            } else {
                setShowImageModal(false);
                setPendingImages([]);
            }
        }
    };

    // Пропуск текущего изображения
    const handleSkipImage = () => {
        if (currentImageIndex < pendingImages.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
            setCurrentImageUrl('');
        } else {
            setShowImageModal(false);
            setPendingImages([]);
        }
    };

    // Очистка редактора
    const clearEditor = () => {
        if (window.confirm('Вы уверены, что хотите очистить редактор?')) {
            setHtmlContent('');
            onChange('');
        }
    };

    // Переключение между режимами редактирования и предпросмотра
    const togglePreview = () => {
        setIsPreviewMode(!isPreviewMode);
    };

    return (
        <div className="html-editor mb-3">
            <label className="form-label">{label || 'HTML-редактор'}</label>

            <div className="btn-toolbar mb-2">
                <div className="btn-group me-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => fileInputRef.current.click()}
                    >
                        Импорт из DOCX
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".docx"
                        style={{ display: 'none' }}
                        onChange={handleDocxUpload}
                    />
                </div>

                <div className="btn-group me-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={clearEditor}
                    >
                        Очистить
                    </button>
                </div>

                <div className="btn-group">
                    <button
                        type="button"
                        className={`btn btn-sm ${isPreviewMode ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={togglePreview}
                    >
                        {isPreviewMode ? 'Редактировать' : 'Предпросмотр'}
                    </button>
                </div>
            </div>

            {isPreviewMode ? (
                <div
                    className="form-control html-preview"
                    style={{ minHeight: '300px', overflow: 'auto', padding: '10px' }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            ) : (
                <textarea
                    className="form-control"
                    value={htmlContent}
                    onChange={handleEditorChange}
                    rows="12"
                />
            )}

            {/* Модальное окно для URL изображений */}
            {showImageModal && (
                <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Введите URL для изображения {currentImageIndex + 1} из {pendingImages.length}
                                </h5>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">URL изображения</label>
                                    <input
                                        type="url"
                                        className="form-control"
                                        value={currentImageUrl}
                                        onChange={(e) => setCurrentImageUrl(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleSkipImage}
                                    >
                                        Пропустить
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleImageUrlConfirm}
                                        disabled={!currentImageUrl}
                                    >
                                        Подтвердить
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HtmlEditor;