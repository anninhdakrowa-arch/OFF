/**
 * Helper to generate realistic high-resolution Vietnamese administrative document images
 * for testing and immediate offline verification without external files.
 */

export function createSampleDocumentImage(
  title: string,
  docNumber: string,
  contentLines: string[]
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1240; // A4 proportional at 150 DPI
    canvas.height = 1754;
    const ctx = canvas.getContext('2d')!;

    // Background paper texture with slight warmth
    ctx.fillStyle = '#fdfdfb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Margins
    const marginLeft = 150;
    const marginRight = canvas.width - 100;
    let y = 140;

    // Header left (Agency name)
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('ỦY BAN NHÂN DÂN', 350, y);
    ctx.font = 'bold 22px "Times New Roman", serif';
    ctx.fillText('THÀNH PHỐ HỒ CHÍ MINH', 350, y + 35);
    ctx.font = 'normal 20px "Times New Roman", serif';
    ctx.fillText(`Số: ${docNumber}`, 350, y + 70);

    // Header right (National motto)
    ctx.font = 'bold 24px "Times New Roman", serif';
    ctx.fillText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 850, y);
    ctx.font = 'bold 22px "Times New Roman", serif';
    ctx.fillText('Độc lập - Tự do - Hạnh phúc', 850, y + 35);

    // Underline motto
    ctx.beginPath();
    ctx.moveTo(700, y + 45);
    ctx.lineTo(1000, y + 45);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.font = 'italic 20px "Times New Roman", serif';
    ctx.fillText('TP. Hồ Chí Minh, ngày 28 tháng 09 năm 2026', 850, y + 80);

    y += 180;

    // Document Title
    ctx.font = 'bold 32px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, y);

    y += 70;

    // Content body
    ctx.font = '22px "Times New Roman", serif';
    ctx.textAlign = 'left';
    const lineHeight = 36;

    for (const line of contentLines) {
      if (line.startsWith('Điều') || line.startsWith('Phần') || line.startsWith('I.') || line.startsWith('II.')) {
        ctx.font = 'bold 22px "Times New Roman", serif';
        y += 15;
      } else {
        ctx.font = '22px "Times New Roman", serif';
      }

      ctx.fillText(line, marginLeft, y);
      y += lineHeight;

      if (y > canvas.height - 180) break;
    }

    // Signature section
    y = Math.max(y + 60, canvas.height - 240);
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px "Times New Roman", serif';
    ctx.fillText('CHỦ TỊCH', 950, y);
    ctx.font = 'italic 18px "Times New Roman", serif';
    ctx.fillText('(Ký tên và đóng dấu)', 950, y + 30);
    ctx.font = 'bold 22px "Times New Roman", serif';
    ctx.fillText('Nguyễn Văn An', 950, y + 140);

    // Add subtle scan noise/angle
    resolve(canvas.toDataURL('image/jpeg', 0.95));
  });
}

export async function generateDemoDocuments() {
  const doc1 = await createSampleDocumentImage(
    'QUYẾT ĐỊNH VỀ VIỆC BAN HÀNH QUY CHẾ LÀM VIỆC',
    '152/QĐ-UBND',
    [
      'Căn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015;',
      'Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05/3/2020 của Chính phủ về công tác văn thư;',
      'Theo đề nghị của Chánh Văn phòng Ủy ban nhân dân Thành phố,',
      'QUYẾT ĐỊNH:',
      'Điều 1. Ban hành kèm theo Quyết định này Quy chế làm việc mới của cơ quan.',
      'Điều 2. Quyết định này có hiệu lực thi hành kể từ ngày ký ban hành.',
      'Điều 3. Các Sở, ban, ngành và Ủy ban nhân dân các quận huyện chịu trách',
      'nhiệm thi hành nghiêm túc Quyết định này.'
    ]
  );

  const doc2 = await createSampleDocumentImage(
    'BÁO CÁO KẾT QUẢ TRIỂN KHAI NHẬN DẠNG TÀI LIỆU',
    '88/BC-STTTT',
    [
      'Kính gửi: Thường trực Ủy ban nhân dân Thành phố.',
      'I. ĐÁNH GIÁ TÌNH HÌNH THỰC HIỆN CÔNG TÁC SỐ HÓA',
      'Trong thời gian qua, các phòng ban chuyên môn đã tích cực ứng dụng phần mềm',
      'nhận dạng ký tự quang học (OCR) chạy hoàn toàn offline trên máy tính Windows.',
      '1. Khối lượng hồ sơ văn bản scan đã số hóa đạt trên 98.5%.',
      '2. Độ chính xác nhận dạng chữ tiếng Việt có dấu đạt mức cao và ổn định.',
      '3. Thời gian xuất kết quả sang định dạng Microsoft Word (.docx) nhanh chóng.',
      'II. PHƯƠNG HƯỚNG NHIỆM VỤ THỜI GIAN TỚI',
      'Tiếp tục tăng cường công tác lưu trữ, kiểm tra đối chiếu văn bản và đảm bảo',
      'an toàn thông tin tuyệt đối không để lộ lọt dữ liệu nội bộ ra môi trường mạng.'
    ]
  );

  return [
    {
      name: 'QuyetDinh_152_QDUBND.jpg',
      dataUrl: doc1,
    },
    {
      name: 'BaoCao_88_BCSTTTT.jpg',
      dataUrl: doc2,
    },
  ];
}
