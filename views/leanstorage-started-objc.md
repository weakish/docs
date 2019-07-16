{# 指定继承模板 #}
{% extends "./leanstorage-started.tmpl" %}

{# --Start--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}
{% set platformName = 'Objective-C' %}
{% set segment_code = "objc" %}
{% set avUserName = 'AVUser' %}
{% set avQueryName = 'AVQuery' %}
{% set avObjectName = 'AVObject' %}
{% set avFileName = 'AVFile' %}
{% set storage_guide_url ="[Objective-C 数据存储开发指南](leanstorage_guide-objc.html)"%}
{# --End--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}

{# --Start--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

{% block code_user_sign_up %}
```objc
    NSString *username = self.usernameTextField.text;
    NSString *password = self.passwordTextField.text;
    NSString *email = self.emailTextField.text;
    if (username && password && email) {
        // LeanCloud - 注册
        // https://leancloud.cn/docs/leanstorage_guide-objc.html#用户名和密码注册
        AVUser *user = [AVUser user];
        user.username = username;
        user.password = password;
        user.email = email;
        [user signUpInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
            if (succeeded) {
                [self performSegueWithIdentifier:@"fromSignUpToProducts" sender:nil];
            } else {
                NSLog(@"注册失败 %@", error);
            }
        }];
    }
```
{% endblock %}

{% block code_user_login %}
```objc
    NSString *username = self.usernameTextField.text;
    NSString *password = self.passwordTextField.text;
    if (username && password) {
        // LeanCloud - 登录
        // https://leancloud.cn/docs/leanstorage_guide-objc.html#登录
        [AVUser logInWithUsernameInBackground:username password:password block:^(AVUser *user, NSError *error) {
            if (error) {
                NSLog(@"登录失败 %@", error);
            } else {
                [self performSegueWithIdentifier:@"fromLoginToProducts" sender:nil];
            }
        }];
    }
```
{% endblock %}

{% block code_create_product_object %}
```objc
    NSString *title = self.titleTextField.text;
    NSNumber *price = [NSNumber numberWithInt:[self.priceTextField.text intValue]];
    NSString *description = self.descriptionTextView.text;
    
    // 保存商品信息
    // LeanCloud - 构建图片
    // https://leancloud.cn/docs/leanstorage_guide-objc.html#从数据流构建文件
    NSData *data = UIImagePNGRepresentation(self.selectedImage);
    AVFile *file = [AVFile fileWithData:data];
    // LeanCloud - 获取当前用户
    // https://leancloud.cn/docs/leanstorage_guide-objc.html#当前用户
    AVUser *currentUser = [AVUser currentUser];
    
    // LeanCloud - 保存对象
    // https://leancloud.cn/docs/leanstorage_guide-objc.html#对象
    AVObject *product = [AVObject objectWithClassName:@"Product"];
    [product setObject:title forKey:@"title"];
    [product setObject:price forKey:@"price"];
    
    // owner 字段为 Pointer 类型，指向 _User 表
    [product setObject:currentUser forKey:@"owner"];
    // image 字段为 File 类型
    [product setObject:file forKey:@"image"];
    [product setObject:description forKey:@"description"];
    [product saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            [self.indicatorView setHidden:YES];
            [self dismissViewControllerAnimated:YES completion:nil];
        } else {
            NSLog(@"保存新物品出错 %@", error);
        }
    }];
```
{% endblock %}

{% block code_query_product %}
```objc
    // LeanCloud - 查询 - 获取商品列表
    // https://leancloud.cn/docs/leanstorage_guide-objc.html#查询
    AVQuery *query = [AVQuery queryWithClassName:@"Product"];
    [query orderByDescending:@"createdAt"];
    // owner 为 Pointer，指向 _User 表
    [query includeKey:@"owner"];
    // image 为 File
    [query includeKey:@"image"];
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        if (!error) {
            self.products = objects;
            [self.tableView reloadData];
        }
    }];
```
{% endblock %}

{% block code_user_logout %}
```objc
    // LeanCloud - 退出登录
    // https://leancloud.cn/docs/leanstorage_guide-objc.html#登出
    [AVUser logOut];
```
{% endblock %}

{# --End--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}
