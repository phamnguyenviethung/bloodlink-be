import { Controller, Post, UploadedFile } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UploadImageToImgurResponseDto } from './dto/response/uploadImageToImgur.response.dto';
import { ImgurService } from './imgur.service';
import { ApiBodyWithSingleFile } from '@/share/decorators/apiBodyFile.decorator';

@Controller('image')
@ApiTags('Image')
export class ImgurController {
  constructor(private readonly imgurService: ImgurService) {}
  @Post('upload')
  @ApiBodyWithSingleFile('imageFile', null, ['imageFile'])
  @ApiOkResponse({
    type: UploadImageToImgurResponseDto,
  })
  async uploadImageToImgur(@UploadedFile() file: Express.Multer.File) {
    return this.imgurService.uploadImage(file);
  }
}
