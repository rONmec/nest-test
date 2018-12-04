import { Get, Controller, Post, Body, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './model/user';
import { UserDto } from './model/user.dto';
import k8s = require('@kubernetes/client-node');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    this.initializeK8();
  }
  k8sApi: any;

  initializeK8() {
    const kc = new k8s.KubeConfig();
    kc.loadFromCluster();
    this.k8sApi = kc.makeApiClient(k8s.Batch_v1Api);
    console.log('Batch_v1Api');
  }

  @Get()
  root(): string {
    this.k8sApi.readNamespacedJobStatus('py-download', 'default', 'true')
      .then((response) => {
        console.log(JSON.stringify(response));
        console.log(JSON.stringify(response.body));
      }, (err) => {
        console.log(JSON.stringify(err));
      });
    return this.appService.root();
  }

  @Post('rest')
  create(@Body() userDto: UserDto, @Res() res) {
    console.log(JSON.stringify(userDto));

    var job = {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        name: 'py-download'
      },
      spec: {
        template: {
          spec: {
            containers: [
              {
                name: 'py-download',
                image: 'ronmec2/py-download',
                command: [
                  'python',
                  'image-downloader.py',
                  '--payload'
                ]
              }
            ],
            restartPolicy: 'Never'
          }
        },
        backoffLimit: 1
      }
    };
    job.spec.template.spec.containers[0].command.push(userDto.url.toString());
    const namespace = 'default';

    this.k8sApi.createNamespacedJob(namespace, job).then(
      (response) => {
        console.log(JSON.stringify(response.body));
        res.status(200).send(response);
      },
      (err) => {
        console.log(JSON.stringify(err));
        res.status(400).send(JSON.stringify(err));
      }
    );
  }
}
